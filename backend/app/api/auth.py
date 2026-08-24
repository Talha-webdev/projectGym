import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.pending_registration import PendingRegistration
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    PendingRegistrationResponse,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.schemas.user import UserResponse
from app.services.email_service import send_password_reset_email, send_verification_email
from app.utils.rate_limiter import rate_limiter
from app.utils.security import (
    create_access_token,
    create_password_reset_token,
    decode_access_token,
    decode_password_reset_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.utils.token_store import token_blacklist

logger = logging.getLogger(settings.APP_NAME)

router = APIRouter(prefix="/auth", tags=["auth"])


async def _issue_refresh_token(user_id, db: AsyncSession) -> str:
    raw_token = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=hash_refresh_token(raw_token),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            revoked=False,
        )
    )
    await db.flush()
    return raw_token


@router.post(
    "/register",
    response_model=PendingRegistrationResponse,
    status_code=status.HTTP_200_OK,
)
async def register(
    request: RegisterRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db),
):
    await rate_limiter.check(
        http_request, max_requests=20, window_seconds=60, key_prefix="register"
    )

    email = request.email.lower()

    existing_user = await db.execute(select(User).where(User.email == email))
    if existing_user.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    existing_pending = await db.execute(
        select(PendingRegistration).where(PendingRegistration.email == email)
    )
    pending = existing_pending.scalar_one_or_none()
    if pending is not None:
        if not pending.is_expired():
            pending.token = PendingRegistration.generate_token()
            pending.expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
            pending.full_name = request.full_name
            pending.password_hash = hash_password(request.password)
            await db.flush()
            email_sent = await send_verification_email(email, request.full_name, pending.token)
            if not email_sent:
                logger.warning("Verification email failed to send to %s", email)
            await db.commit()
            return PendingRegistrationResponse(
                message="A new verification email has been sent. Please check your inbox.",
                email=email,
            )
        else:
            await db.delete(pending)
            await db.flush()

    token = PendingRegistration.generate_token()
    pending = PendingRegistration(
        email=email,
        full_name=request.full_name,
        password_hash=hash_password(request.password),
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )
    db.add(pending)
    await db.flush()

    email_sent = await send_verification_email(email, request.full_name, token)
    if not email_sent:
        logger.warning("Verification email failed to send to %s", email)

    await db.commit()

    return PendingRegistrationResponse(
        message="Verification email sent. Please check your inbox to complete registration.",
        email=email,
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db),
):
    await rate_limiter.check(
        http_request, max_requests=20, window_seconds=60, key_prefix="login"
    )

    result = await db.execute(select(User).where(User.email == request.email.lower()))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = await _issue_refresh_token(user.id, db)

    await db.commit()
    await db.refresh(user)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(request.refresh_token)
        )
    )
    stored_token = result.scalar_one_or_none()
    if (
        stored_token is None
        or stored_token.revoked
        or stored_token.expires_at <= datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_result = await db.execute(
        select(User).where(User.id == stored_token.user_id)
    )
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    stored_token.revoked = True
    new_refresh_token = await _issue_refresh_token(user.id, db)
    await db.commit()

    access_token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: RefreshRequest,
    request_http: Request,
    db: AsyncSession = Depends(get_db),
):
    # Blacklist the access token from the Authorization header (if present)
    auth_header = request_http.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        access_token = auth_header[7:]
        payload = decode_access_token(access_token)
        if payload is not None:
            jti = payload.get("jti")
            if jti:
                exp = payload.get("exp")
                if exp:
                    expires_at = exp
                    token_blacklist.add(jti, expires_at)

    # Revoke the refresh token
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(request.refresh_token)
        )
    )
    stored_token = result.scalar_one_or_none()
    if stored_token is not None and not stored_token.revoked:
        stored_token.revoked = True
        await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db),
):
    await rate_limiter.check(
        http_request, max_requests=5, window_seconds=300, key_prefix="forgot_password"
    )

    result = await db.execute(select(User).where(User.email == request.email.lower()))
    user = result.scalar_one_or_none()
    if user is not None:
        reset_token = create_password_reset_token(
            {"sub": str(user.id)},
            expires_delta=timedelta(hours=1),
        )
        email_sent = await send_password_reset_email(user.email, user.full_name, reset_token)
        if not email_sent:
            logger.warning("Password reset email failed to send to %s", user.email)

    return {"message": "If an account exists for that email, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    payload = decode_password_reset_token(request.token)
    if payload is None or payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )

    user.password_hash = hash_password(request.password)

    # Revoke all existing refresh tokens for this user
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user.id,
            RefreshToken.revoked == False,
        )
    )
    for token in result.scalars().all():
        token.revoked = True

    await db.commit()
    return {"message": "Password has been reset successfully"}


@router.post("/verify-email")
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PendingRegistration).where(
            PendingRegistration.token == request.token,
        )
    )
    pending = result.scalar_one_or_none()

    if pending is not None:
        if pending.is_expired():
            await db.delete(pending)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification link has expired. Please register again.",
            )

        user = User(
            email=pending.email,
            password_hash=pending.password_hash,
            full_name=pending.full_name,
            is_verified=True,
        )
        db.add(user)
        await db.flush()

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = await _issue_refresh_token(user.id, db)

        await db.delete(pending)
        await db.commit()
        await db.refresh(user)

        return {
            "message": "Registration successful! Your email has been verified.",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": UserResponse.model_validate(user).model_dump(),
        }

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid or expired verification token",
    )
