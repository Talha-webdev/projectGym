import uuid
import pytest
from unittest.mock import MagicMock, AsyncMock
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_as_admin(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    # get_dashboard makes 7 execute calls (users, members, revenue, month_rev, videos, blogs, gallery)
    data_mock = MagicMock()
    data_mock.scalar.return_value = 0
    mock_db.execute.side_effect = [admin_mock] + [data_mock] * 7
    response = await async_client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_dashboard_unauthorized(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    from tests.conftest import MockUser
    user = MockUser()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/admin/dashboard", headers=auth_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_users(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    users = [MockUser(), MockUser()]
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    count_mock = MagicMock()
    count_mock.scalar.return_value = 2
    list_mock = MagicMock()
    list_mock.scalars.return_value.unique.return_value.all.return_value = users
    mock_db.execute.side_effect = [admin_mock, count_mock, list_mock]
    response = await async_client.get("/api/v1/admin/users", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.asyncio
async def test_admin_user_detail(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    target_user = MockUser()
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    detail_mock = MagicMock()
    detail_mock.scalar_one_or_none.return_value = target_user
    detail_mock.unique.return_value = detail_mock
    mock_db.execute.side_effect = [admin_mock, detail_mock]
    user_id = str(uuid.uuid4())
    response = await async_client.get(f"/api/v1/admin/users/{user_id}", headers=admin_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_admin_manage_membership(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    detail_mock = MagicMock()
    detail_mock.scalar_one_or_none.return_value = MockUser()
    detail_mock.unique.return_value = detail_mock
    mock_db.execute.side_effect = [admin_mock, detail_mock]
    user_id = str(uuid.uuid4())
    payload = {"action": "extend", "days": 90}
    response = await async_client.patch(
        f"/api/v1/admin/users/{user_id}/membership",
        json=payload,
        headers=admin_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_admin_payments(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    count_mock = MagicMock()
    count_mock.scalar.return_value = 0
    list_mock = MagicMock()
    list_mock.scalars.return_value.unique.return_value.all.return_value = []
    mock_db.execute.side_effect = [admin_mock, count_mock, list_mock]
    response = await async_client.get("/api/v1/admin/payments", headers=admin_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_admin_comments(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    count_mock = MagicMock()
    count_mock.scalar.return_value = 0
    list_mock = MagicMock()
    list_mock.scalars.return_value.unique.return_value.all.return_value = []
    mock_db.execute.side_effect = [admin_mock, count_mock, list_mock]
    response = await async_client.get("/api/v1/admin/comments", headers=admin_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_admin_delete_comment(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    mock_db.execute.return_value = admin_mock
    comment_id = str(uuid.uuid4())
    response = await async_client.delete(f"/api/v1/admin/comments/{comment_id}", headers=admin_headers)
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_admin_settings(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    settings_mock = MagicMock()
    settings_mock.scalars.return_value.all.return_value = []
    mock_db.execute.side_effect = [admin_mock, settings_mock]
    response = await async_client.get("/api/v1/admin/settings", headers=admin_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_admin_update_settings(async_client: AsyncClient, admin_headers, override_get_db, mock_db):
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    find_mock = MagicMock()
    find_mock.scalar_one_or_none.return_value = None
    # 2 settings lookups (site_name, description) + 1 get_settings call
    settings_list_mock = MagicMock()
    settings_list_mock.scalars.return_value.all.return_value = []
    mock_db.execute.side_effect = [admin_mock, find_mock, find_mock, settings_list_mock]
    payload = {"site_name": "Project GYM", "description": "A test update"}
    response = await async_client.patch("/api/v1/admin/settings", json=payload, headers=admin_headers)
    assert response.status_code == 200
