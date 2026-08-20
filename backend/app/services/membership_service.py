from datetime import datetime, timezone, timedelta
from decimal import Decimal
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.membership import Membership
from app.models.payment import Payment
from app.schemas.membership import MembershipStatusResponse
from app.schemas.payment import PaymentResponse, VerifySessionResponse


class MembershipService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_status(self, user_id: str) -> MembershipStatusResponse:
        user_uuid = UUID(user_id)
        result = await self.db.execute(
            select(Membership).where(Membership.user_id == user_uuid)
        )
        membership = result.scalar_one_or_none()

        if not membership:
            return MembershipStatusResponse(is_active=False)

        now = datetime.now(timezone.utc)

        if membership.is_active and membership.end_date and membership.end_date <= now:
            membership.is_active = False
            await self.db.commit()

        days_remaining = None
        if membership.end_date:
            remaining = (membership.end_date - now).days
            days_remaining = max(remaining, 0)

        return MembershipStatusResponse(
            is_active=membership.is_active,
            start_date=membership.start_date,
            end_date=membership.end_date,
            days_remaining=days_remaining,
        )

    async def activate(
        self,
        user_id: str,
        stripe_subscription_id: str | None = None,
    ) -> Membership:
        user_uuid = UUID(user_id)
        now = datetime.now(timezone.utc)
        end_date = now + timedelta(days=90)

        result = await self.db.execute(
            select(Membership).where(Membership.user_id == user_uuid)
        )
        membership = result.scalar_one_or_none()

        if membership:
            membership.is_active = True
            membership.start_date = now
            membership.end_date = end_date
            if stripe_subscription_id:
                membership.stripe_subscription_id = stripe_subscription_id
        else:
            membership = Membership(
                user_id=user_uuid,
                is_active=True,
                start_date=now,
                end_date=end_date,
                stripe_subscription_id=stripe_subscription_id,
            )
            self.db.add(membership)

        await self.db.commit()
        await self.db.refresh(membership)
        return membership

    async def deactivate(self, user_id: str) -> bool:
        user_uuid = UUID(user_id)
        result = await self.db.execute(
            select(Membership).where(Membership.user_id == user_uuid)
        )
        membership = result.scalar_one_or_none()

        if not membership:
            return False

        membership.is_active = False
        await self.db.commit()
        return True

    async def deactivate_by_subscription(self, subscription_id: str) -> bool:
        result = await self.db.execute(
            select(Membership).where(
                Membership.stripe_subscription_id == subscription_id
            )
        )
        membership = result.scalar_one_or_none()

        if not membership:
            return False

        membership.is_active = False
        await self.db.commit()
        return True

    # ── Payment recording ────────────────────────────────────

    async def payment_exists_by_session(self, session_id: str) -> bool:
        result = await self.db.execute(
            select(Payment).where(Payment.stripe_session_id == session_id)
        )
        return result.scalar_one_or_none() is not None

    async def payment_exists_by_intent(self, payment_intent_id: str) -> bool:
        result = await self.db.execute(
            select(Payment).where(
                Payment.stripe_payment_intent_id == payment_intent_id
            )
        )
        return result.scalar_one_or_none() is not None

    async def record_payment(
        self,
        user_id: str,
        session_id: str,
        amount: Decimal,
        currency: str = "usd",
        payment_intent_id: str | None = None,
        charge_id: str | None = None,
    ) -> Payment:
        payment = Payment(
            user_id=UUID(user_id),
            stripe_session_id=session_id,
            stripe_payment_intent_id=payment_intent_id,
            stripe_charge_id=charge_id,
            amount=amount,
            currency=currency,
            status="completed",
        )
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return payment

    async def mark_payment_refunded(self, payment_intent_id: str) -> bool:
        result = await self.db.execute(
            select(Payment).where(
                Payment.stripe_payment_intent_id == payment_intent_id
            )
        )
        payment = result.scalar_one_or_none()
        if not payment:
            return False
        payment.status = "refunded"
        await self.db.commit()
        return True

    async def mark_payment_failed(self, session_id: str) -> bool:
        result = await self.db.execute(
            select(Payment).where(Payment.stripe_session_id == session_id)
        )
        payment = result.scalar_one_or_none()
        if not payment:
            return False
        payment.status = "failed"
        await self.db.commit()
        return True

    async def get_payments(self, user_id: str) -> list[PaymentResponse]:
        user_uuid = UUID(user_id)
        result = await self.db.execute(
            select(Payment)
            .where(Payment.user_id == user_uuid)
            .order_by(Payment.created_at.desc())
        )
        return [
            PaymentResponse.model_validate(p) for p in result.scalars().all()
        ]

    async def get_payment_by_session(self, session_id: str) -> PaymentResponse | None:
        result = await self.db.execute(
            select(Payment).where(Payment.stripe_session_id == session_id)
        )
        payment = result.scalar_one_or_none()
        if not payment:
            return None
        return PaymentResponse.model_validate(payment)

    async def verify_session(self, session_id: str, user_id: str) -> VerifySessionResponse:
        payment = await self.get_payment_by_session(session_id)
        if not payment:
            return VerifySessionResponse(valid=False, status="not_found")
        if payment.id.startswith(user_id[:8]):
            pass
        is_owner = False
        result = await self.db.execute(
            select(Payment).where(
                Payment.stripe_session_id == session_id,
                Payment.user_id == UUID(user_id),
            )
        )
        if result.scalar_one_or_none():
            is_owner = True

        return VerifySessionResponse(
            valid=is_owner and payment.status == "completed",
            status=payment.status,
        )

    # ── Membership helpers ───────────────────────────────────

    async def is_member(self, user_id: str) -> bool:
        user_uuid = UUID(user_id)
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(Membership).where(
                Membership.user_id == user_uuid,
                Membership.is_active.is_(True),
                Membership.end_date > now,
            )
        )
        return result.scalar_one_or_none() is not None
