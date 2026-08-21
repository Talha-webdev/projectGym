import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.utils.security import (
    create_access_token,
    create_password_reset_token,
    hash_password,
)
from app.schemas.user import UserResponse


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient, override_get_db, mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    payload = {
        "email": "newuser@example.com",
        "password": "StrongPass123!",
        "full_name": "New User",
    }
    fake_user_resp = UserResponse(
        id="00000000-0000-0000-0000-000000000001",
        email="newuser@example.com",
        full_name="New User",
        is_admin=False,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    with patch.object(UserResponse, "model_validate", return_value=fake_user_resp):
        response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == payload["email"]


@pytest.mark.asyncio
async def test_register_email_exists(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockUser
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = MockUser()
    mock_db.execute.return_value = mock_result
    payload = {
        "email": "existing@example.com",
        "password": "StrongPass123!",
        "full_name": "Existing User",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockUser
    user = MockUser()
    user.password_hash = hash_password("StrongPass123!")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result
    fake_user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_admin=user.is_admin,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )
    with patch.object(UserResponse, "model_validate", return_value=fake_user_resp):
        payload = {"email": user.email, "password": "StrongPass123!"}
        response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client: AsyncClient, override_get_db, mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    payload = {"email": "wrong@example.com", "password": "WrongPass123!"}
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


@pytest.mark.asyncio
async def test_refresh_token(async_client: AsyncClient, override_get_db, mock_db):
    from app.models.refresh_token import RefreshToken
    refresh = MagicMock(spec=RefreshToken)
    refresh.user_id = "user-123"
    refresh.revoked = False
    refresh.expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = refresh
    mock_db.execute.return_value = mock_result
    payload = {"refresh_token": "valid-refresh-token"}
    response = await async_client.post("/api/v1/auth/refresh", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_refresh_invalid(async_client: AsyncClient, override_get_db, mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    payload = {"refresh_token": "invalid-token"}
    response = await async_client.post("/api/v1/auth/refresh", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_forgot_password(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockUser
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = MockUser()
    mock_db.execute.return_value = mock_result
    payload = {"email": "test@example.com"}
    response = await async_client.post("/api/v1/auth/forgot-password", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_reset_password(async_client: AsyncClient, override_get_db, mock_db):
    from datetime import timedelta
    from tests.conftest import MockUser
    user = MockUser()
    reset_token = create_password_reset_token(
        {"sub": user.id},
        expires_delta=timedelta(hours=1),
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result
    payload = {"token": reset_token, "password": "NewStrongPass456!"}
    response = await async_client.post("/api/v1/auth/reset-password", json=payload)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_logout(async_client: AsyncClient, override_get_db, mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = MagicMock()
    mock_db.execute.return_value = mock_result
    payload = {"refresh_token": "token-to-revoke"}
    response = await async_client.post("/api/v1/auth/logout", json=payload)
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_register_weak_password_rejected(async_client: AsyncClient):
    payload = {
        "email": "weak@example.com",
        "password": "short",
        "full_name": "Weak Pass",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email_rejected(async_client: AsyncClient):
    payload = {
        "email": "not-an-email",
        "password": "StrongPass123!",
        "full_name": "Bad Email",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_full_name_rejected(async_client: AsyncClient):
    payload = {
        "email": "badname@example.com",
        "password": "StrongPass123!",
        "full_name": "<script>alert(1)</script>",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_invalid_email_format_rejected(async_client: AsyncClient):
    payload = {"email": "not-an-email", "password": "StrongPass123!"}
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_nonexistent_email_rejected(
    async_client: AsyncClient, override_get_db, mock_db
):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    payload = {"email": "nobody@example.com", "password": "Whatever123!"}
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_revoked_token_rejected(
    async_client: AsyncClient, override_get_db, mock_db
):
    from app.models.refresh_token import RefreshToken

    refresh = MagicMock(spec=RefreshToken)
    refresh.user_id = "user-123"
    refresh.revoked = True
    refresh.expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = refresh
    mock_db.execute.return_value = mock_result
    payload = {"refresh_token": "revoked-token"}
    response = await async_client.post("/api/v1/auth/refresh", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_expired_token_rejected(
    async_client: AsyncClient, override_get_db, mock_db
):
    from app.models.refresh_token import RefreshToken

    refresh = MagicMock(spec=RefreshToken)
    refresh.user_id = "user-123"
    refresh.revoked = False
    refresh.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = refresh
    mock_db.execute.return_value = mock_result
    payload = {"refresh_token": "expired-token"}
    response = await async_client.post("/api/v1/auth/refresh", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout_unknown_token_still_204(
    async_client: AsyncClient, override_get_db, mock_db
):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    payload = {"refresh_token": "unknown-token"}
    response = await async_client.post("/api/v1/auth/logout", json=payload)
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_forgot_password_unknown_email_returns_same_message(
    async_client: AsyncClient, override_get_db, mock_db
):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    payload = {"email": "ghost@example.com"}
    response = await async_client.post("/api/v1/auth/forgot-password", json=payload)
    assert response.status_code == 200
    assert "message" in response.json()


@pytest.mark.asyncio
async def test_reset_password_invalid_token_rejected(
    async_client: AsyncClient, override_get_db, mock_db
):
    payload = {"token": "not-a-valid-token", "password": "NewStrongPass456!"}
    response = await async_client.post("/api/v1/auth/reset-password", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_reset_password_wrong_type_token_rejected(
    async_client: AsyncClient, override_get_db, mock_db
):
    token = create_access_token({"sub": "user-123"}, expires_delta=timedelta(hours=1))
    payload = {"token": token, "password": "NewStrongPass456!"}
    response = await async_client.post("/api/v1/auth/reset-password", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_reset_password_success_no_patch(
    async_client: AsyncClient, override_get_db, mock_db
):
    from tests.conftest import MockUser

    user = MockUser()
    token = create_password_reset_token({"sub": str(user.id)}, expires_delta=timedelta(hours=1))
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result
    payload = {"token": token, "password": "NewStrongPass456!"}
    response = await async_client.post("/api/v1/auth/reset-password", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Password has been reset successfully"


@pytest.mark.asyncio
async def test_verify_email_success(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockUser

    verification = MagicMock()
    verification.user_id = str(uuid.uuid4())
    verification.is_expired.return_value = False
    vt_result = MagicMock()
    vt_result.scalar_one_or_none.return_value = verification

    user = MockUser()
    user.is_verified = False
    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user

    mock_db.execute.side_effect = [vt_result, user_result]
    response = await async_client.post(
        "/api/v1/auth/verify-email", json={"token": "valid-token"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Email verified successfully"


@pytest.mark.asyncio
async def test_verify_email_invalid_token_rejected(
    async_client: AsyncClient, override_get_db, mock_db
):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    response = await async_client.post(
        "/api/v1/auth/verify-email", json={"token": "bad-token"}
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_verify_email_already_verified(
    async_client: AsyncClient, override_get_db, mock_db
):
    from tests.conftest import MockUser

    verification = MagicMock()
    verification.user_id = str(uuid.uuid4())
    verification.is_expired.return_value = False
    vt_result = MagicMock()
    vt_result.scalar_one_or_none.return_value = verification

    user = MockUser()
    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user

    mock_db.execute.side_effect = [vt_result, user_result]
    response = await async_client.post(
        "/api/v1/auth/verify-email", json={"token": "used-token"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Email is already verified"


@pytest.mark.asyncio
async def test_get_me_with_valid_token(
    async_client: AsyncClient, override_get_db, mock_db, test_user
):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = test_user
    mock_db.execute.return_value = mock_result
    token = create_access_token({"sub": str(test_user.id)})
    response = await async_client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email


@pytest.mark.asyncio
async def test_get_me_without_token(async_client: AsyncClient):
    response = await async_client.get("/api/v1/users/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_with_invalid_token(async_client: AsyncClient):
    response = await async_client.get(
        "/api/v1/users/me", headers={"Authorization": "Bearer not.a.valid.token"}
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_with_expired_token(
    async_client: AsyncClient, override_get_db, mock_db, test_user
):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = test_user
    mock_db.execute.return_value = mock_result
    token = create_access_token({"sub": str(test_user.id)}, expires_delta=timedelta(seconds=-5))
    response = await async_client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
