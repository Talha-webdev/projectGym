import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.membership import MembershipStatusResponse, CheckoutResponse
from app.schemas.payment import PaymentResponse, VerifySessionResponse
from app.services.membership_service import MembershipService
from app.config import settings
from app.utils.rate_limiter import rate_limiter

logger = logging.getLogger("membership")
router = APIRouter(prefix="/membership", tags=["membership"])


@router.get("/status", response_model=MembershipStatusResponse)
async def get_membership_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MembershipService(db)
    return await service.get_status(str(current_user.id))


@router.post("/create-checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    request_http: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await rate_limiter.check_user(request_http, str(current_user.id), max_requests=3, window_seconds=300)
    service = MembershipService(db)
    membership_status = await service.get_status(str(current_user.id))

    if membership_status.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already has an active membership.",
        )

    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{"price": settings.STRIPE_PRICE_ID, "quantity": 1}],
            client_reference_id=str(current_user.id),
            customer_email=current_user.email,
            metadata={
                "user_id": str(current_user.id),
                "plan": "3-month-premium",
            },
            success_url=settings.FRONTEND_URL + "/membership/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=settings.FRONTEND_URL + "/membership/cancel",
        )
        return CheckoutResponse(checkout_url=session.url, session_id=session.id)

    except stripe.error.StripeError as e:
        logger.error("Stripe checkout error: %s", e.user_message or e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Payment service temporarily unavailable. Please try again.",
        )
    except Exception as e:
        logger.exception("Unexpected checkout error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.get("/verify-session/{session_id}", response_model=VerifySessionResponse)
async def verify_checkout_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except stripe.error.StripeError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found.",
        )

    if session.payment_status != "paid":
        return VerifySessionResponse(valid=False, status=session.payment_status)

    if session.metadata and session.metadata.get("user_id") != str(current_user.id):
        return VerifySessionResponse(valid=False, status="unauthorized")

    service = MembershipService(db)
    membership_status = await service.get_status(str(current_user.id))

    return VerifySessionResponse(
        valid=membership_status.is_active,
        status="completed" if membership_status.is_active else "pending",
    )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload",
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature",
        )

    event_type = event["type"]
    event_id = event["id"]
    data = event["data"]["object"]
    logger.info("Processing webhook event: %s (%s)", event_type, event_id)

    service = MembershipService(db)

    try:
        if event_type == "checkout.session.completed":
            await _handle_checkout_completed(service, data)

        elif event_type == "checkout.session.async_payment_failed":
            await _handle_payment_failed(service, data)

        elif event_type == "charge.refunded":
            await _handle_charge_refunded(service, data)

        elif event_type == "customer.subscription.deleted":
            await _handle_subscription_deleted(service, data)

        else:
            logger.info("Unhandled event type: %s", event_type)
    except Exception as e:
        logger.exception("Error processing webhook event %s: %s", event_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed.",
        )

    return {"received": True}


async def _handle_checkout_completed(service: MembershipService, session: dict):
    user_id = session.get("client_reference_id")
    session_id = session["id"]
    payment_intent_id = session.get("payment_intent")
    charge_id = None

    if session.get("payment_status") != "paid":
        logger.warning("Session %s not paid (status: %s)", session_id, session.get("payment_status"))
        return

    if await service.payment_exists_by_session(session_id):
        logger.info("Session %s already processed, skipping.", session_id)
        return

    if payment_intent_id:
        import stripe
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if payment_intent.get("latest_charge"):
                charge_id = payment_intent["latest_charge"]
            if payment_intent.get("charges") and payment_intent["charges"]["data"]:
                charge_id = payment_intent["charges"]["data"][0].get("id", charge_id)
        except Exception:
            logger.warning("Could not retrieve charge ID for intent %s", payment_intent_id)

    if not user_id:
        logger.warning("Session %s has no client_reference_id, skipping.", session_id)
        return

    await service.activate(user_id=user_id)
    await service.record_payment(
        user_id=user_id,
        session_id=session_id,
        amount=session["amount_total"] / 100,
        currency=session.get("currency", "usd"),
        payment_intent_id=payment_intent_id,
        charge_id=charge_id,
    )
    logger.info("Membership activated for user %s (session %s)", user_id, session_id)


async def _handle_payment_failed(service: MembershipService, session: dict):
    session_id = session["id"]
    await service.mark_payment_failed(session_id)
    logger.info("Payment marked as failed for session %s", session_id)


async def _handle_charge_refunded(service: MembershipService, charge: dict):
    payment_intent_id = charge.get("payment_intent")
    if not payment_intent_id:
        logger.warning("Refund event missing payment_intent")
        return

    await service.mark_payment_refunded(payment_intent_id)
    logger.info("Payment refunded for intent %s", payment_intent_id)


async def _handle_subscription_deleted(service: MembershipService, subscription: dict):
    await service.deactivate_by_subscription(subscription["id"])
    logger.info("Membership deactivated for subscription %s", subscription["id"])


@router.get("/payments", response_model=list[PaymentResponse])
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MembershipService(db)
    return await service.get_payments(str(current_user.id))
