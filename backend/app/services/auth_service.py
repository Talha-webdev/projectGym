from datetime import datetime, timezone, timedelta
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.verification_token import VerificationToken


async def create_verification_token(user: User, db: AsyncSession) -> str:
    raw_token = VerificationToken.generate_token()
    new_token = VerificationToken(
        user_id=user.id,
        token=raw_token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        used=False,
    )
    db.add(new_token)
    await db.flush()
    return raw_token


async def verify_email_token(token: str, db: AsyncSession) -> tuple[bool, User | None, str]:
    result = await db.execute(
        select(VerificationToken).where(
            VerificationToken.token == token,
            VerificationToken.used == False
        )
    )
    verification = result.scalar_one_or_none()
    if verification is None:
        return False, None, "invalid"

    if verification.is_expired():
        return False, None, "expired"

    user_result = await db.execute(select(User).where(User.id == verification.user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        return False, None, "invalid"

    if user.is_verified:
        return False, user, "already_verified"

    verification.used = True
    user.is_verified = True
    await db.flush()
    return True, user, "verified"


async def invalidate_old_tokens(user: User, db: AsyncSession) -> None:
    result = await db.execute(
        select(VerificationToken).where(
            VerificationToken.user_id == user.id,
            VerificationToken.used == False
        )
    )
    old_tokens = result.scalars().all()
    for t in old_tokens:
        t.used = True
    await db.flush()
