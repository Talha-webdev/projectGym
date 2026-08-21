"""Deactivate expired memberships.

Usage (from the backend directory):

    python scripts/check_expired_memberships.py

Finds active memberships whose end_date has passed and deactivates them by
reusing the existing deactivation logic in MembershipService (SRS FR-18).
"""

import asyncio
import os
import sys
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

from sqlalchemy import select  # noqa: E402

from app.database import async_session_factory  # noqa: E402
from app.models.membership import Membership  # noqa: E402
from app.models.user import User  # noqa: E402
from app.services.membership_service import MembershipService  # noqa: E402


async def deactivate_expired() -> tuple[int, int]:
    """Return (checked, deactivated)."""
    async with async_session_factory() as db:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(User)
            .join(Membership, Membership.user_id == User.id)
            .where(
                Membership.is_active.is_(True),
                Membership.end_date.is_not(None),
                Membership.end_date <= now,
            )
        )
        users = result.scalars().all()

        service = MembershipService(db)
        deactivated = 0
        for user in users:
            status = await service.get_status(str(user.id))
            if not status.is_active:
                deactivated += 1

        return len(users), deactivated


async def main() -> int:
    try:
        checked, deactivated = await deactivate_expired()
    except Exception as exc:
        print(f"ERROR: failed to check memberships: {exc}")
        return 1

    print(f"Checked {checked} expired membership(s); deactivated {deactivated}.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))