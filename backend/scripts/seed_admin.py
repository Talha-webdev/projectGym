"""Create the initial admin user.

Usage (from the backend directory):

    python scripts/seed_admin.py

Credentials are read from the ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_FULL_NAME
environment variables when present; otherwise the script prompts
interactively (the password is masked via getpass).

Only a single admin account is allowed (SRS FR-45). If any admin already
exists, the script refuses to create another and reports it.
"""

import asyncio
import getpass
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

from sqlalchemy import select  # noqa: E402

from app.database import async_session_factory  # noqa: E402
from app.models.user import User  # noqa: E402
from app.utils.security import hash_password  # noqa: E402


PASSWORD_ERRORS = (
    "Password must be 8-128 characters, include one uppercase letter, "
    "one lowercase letter, and one number."
)


def validate_password(password: str) -> None:
    errors = []
    if len(password) < 8:
        errors.append("at least 8 characters")
    if len(password) > 128:
        errors.append("at most 128 characters")
    if not re.search(r"[A-Z]", password):
        errors.append("one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("one lowercase letter")
    if not re.search(r"[0-9]", password):
        errors.append("one number")
    if errors:
        raise ValueError("Password requires " + "; ".join(errors))


def validate_email(email: str) -> str:
    email = email.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise ValueError(f"Invalid email address: {email}")
    return email


async def seed_admin(email: str, password: str, full_name: str) -> str:
    """Create the first admin. Returns a status message."""
    async with async_session_factory() as db:
        existing_admin = await db.execute(
            select(User).where(User.is_admin.is_(True)).limit(1)
        )
        admin = existing_admin.scalar_one_or_none()
        if admin is not None:
            return f"admin_exists|{admin.email}"

        existing_user = await db.execute(
            select(User).where(User.email == email)
        )
        user = existing_user.scalar_one_or_none()
        if user is not None:
            role = "admin" if user.is_admin else "user"
            return f"email_exists|{email}|{role}"

        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            is_admin=True,
            is_verified=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return f"created|{user.email}"


async def main() -> int:
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    full_name = os.getenv("ADMIN_FULL_NAME", "Administrator")

    interactive = not (email and password)

    if not email:
        email = input("Admin email: ").strip()
    try:
        email = validate_email(email)
    except ValueError as exc:
        print(f"ERROR: {exc}")
        return 1

    if not password:
        password = getpass.getpass("Admin password: ")
    try:
        validate_password(password)
    except ValueError as exc:
        print(f"ERROR: {exc}")
        return 1

    if not full_name or (interactive and os.getenv("ADMIN_FULL_NAME") is None):
        entered = input(f"Admin full name [{full_name}]: ").strip()
        if entered:
            full_name = entered

    try:
        result = await seed_admin(email, password, full_name)
    except Exception as exc:
        print(f"ERROR: failed to create admin: {exc}")
        return 1

    parts = result.split("|")
    if parts[0] == "created":
        print(f"Admin created successfully: {parts[1]}")
        return 0
    if parts[0] == "admin_exists":
        print(f"Admin already exists ({parts[1]}); not creating a duplicate.")
        return 1
    if parts[0] == "email_exists":
        print(
            f"A {parts[2]} already exists with email {parts[1]}; "
            "not modifying it."
        )
        return 1
    print(f"ERROR: unexpected result: {result}")
    return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))