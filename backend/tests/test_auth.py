from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.utils.security import create_access_token, hash_password
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
    from unittest.mock import patch
    from app.utils import security as security_utils
    from tests.conftest import MockUser
    user = MockUser()
    reset_token = create_access_token(
        {"sub": user.id, "type": "password_reset"},
        expires_delta=timedelta(hours=1),
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result
    payload = {"token": reset_token, "password": "NewStrongPass456!"}
    with patch.object(security_utils, "decode_access_token", return_value={"sub": user.id, "type": "password_reset"}):
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
