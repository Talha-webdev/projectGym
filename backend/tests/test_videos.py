import uuid
from datetime import datetime, timezone
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_videos(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockVideo
    videos = [MockVideo(), MockVideo()]
    mock_result = MagicMock()
    mock_result.scalars.return_value.unique.return_value.all.return_value = videos
    mock_result.scalar.return_value = 2
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/videos")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_get_video_by_slug(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockVideo
    video = MockVideo()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = video
    mock_db.execute.return_value = mock_result
    response = await async_client.get(f"/api/v1/videos/{video.slug}")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == video.slug
    assert data["title"] == video.title


@pytest.mark.asyncio
async def test_get_video_not_found(async_client: AsyncClient, override_get_db, mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/videos/non-existent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_video_as_admin(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    from unittest.mock import patch
    from app.schemas.video import VideoResponse
    from tests.conftest import MockUser
    admin_user = MockUser(is_admin=True)
    admin_mock = MagicMock()
    admin_mock.scalar_one_or_none.return_value = admin_user
    slug_mock = MagicMock()
    slug_mock.scalar_one_or_none.return_value = None
    mock_db.execute.side_effect = [admin_mock, slug_mock]
    payload = {
        "title": "New Video",
        "slug": "new-video",
        "description": "A new video",
        "cloudinary_public_id": "test/public",
        "cloudinary_url": "https://res.cloudinary.com/test/video.mp4",
    }
    fake_resp = VideoResponse(
        id=str(uuid.uuid4()), title=payload["title"], slug="new-video",
        cloudinary_url=payload["cloudinary_url"], is_premium=False, view_count=0,
        created_at=datetime.now(timezone.utc),
    )
    with patch.object(VideoResponse, "model_validate", return_value=fake_resp):
        response = await async_client.post("/api/v1/videos", json=payload, headers=admin_headers)
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_create_video_unauthorized(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    from tests.conftest import MockUser
    user = MockUser()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result
    payload = {
        "title": "New Video",
        "slug": "new-video",
        "cloudinary_public_id": "test/public",
        "cloudinary_url": "https://res.cloudinary.com/test/video.mp4",
    }
    response = await async_client.post("/api/v1/videos", json=payload, headers=auth_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_video_no_auth(async_client: AsyncClient):
    payload = {
        "title": "New Video",
        "slug": "new-video",
        "cloudinary_public_id": "test/public",
        "cloudinary_url": "https://res.cloudinary.com/test/video.mp4",
    }
    response = await async_client.post("/api/v1/videos", json=payload)
    assert response.status_code == 401


# ── Premium URL security tests ──────────────────────────────────


@pytest.mark.asyncio
async def test_list_hides_premium_url_unauthenticated(async_client: AsyncClient, override_get_db, mock_db):
    """Unauthenticated user must NOT receive a usable premium video URL."""
    from tests.conftest import MockVideo
    from app.schemas.video import VideoResponse

    premium_video = MockVideo(is_premium=True)
    premium_video.cloudinary_url = "https://res.cloudinary.com/secret/premium.mp4"

    fake_resp = VideoResponse(
        id=premium_video.id, title=premium_video.title, slug=premium_video.slug,
        cloudinary_url=premium_video.cloudinary_url, is_premium=True, view_count=0,
        created_at=premium_video.created_at,
    )

    count_result = MagicMock()
    count_result.scalar.return_value = 1
    list_result = MagicMock()
    list_result.scalars.return_value.unique.return_value.all.return_value = [premium_video]
    mock_db.execute.side_effect = [count_result, list_result]

    with patch.object(VideoResponse, "model_validate", return_value=fake_resp):
        response = await async_client.get("/api/v1/videos")

    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 1
    assert items[0]["is_premium"] is True
    assert items[0]["cloudinary_url"] == ""


@pytest.mark.asyncio
async def test_list_hides_premium_url_non_member(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    """Authenticated user without membership must NOT receive premium URL."""
    from tests.conftest import MockUser, MockVideo
    from app.schemas.video import VideoResponse

    user = MockUser()
    premium_video = MockVideo(is_premium=True)
    premium_video.cloudinary_url = "https://res.cloudinary.com/secret/premium.mp4"

    fake_resp = VideoResponse(
        id=premium_video.id, title=premium_video.title, slug=premium_video.slug,
        cloudinary_url=premium_video.cloudinary_url, is_premium=True, view_count=0,
        created_at=premium_video.created_at,
    )

    # 1: get_optional_user lookup, 2: video count, 3: video list, 4: membership check
    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user
    count_result = MagicMock()
    count_result.scalar.return_value = 1
    list_result = MagicMock()
    list_result.scalars.return_value.unique.return_value.all.return_value = [premium_video]
    membership_result = MagicMock()
    membership_result.scalar_one_or_none.return_value = None
    mock_db.execute.side_effect = [user_result, count_result, list_result, membership_result]

    with patch.object(VideoResponse, "model_validate", return_value=fake_resp):
        response = await async_client.get("/api/v1/videos", headers=auth_headers)

    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cloudinary_url"] == ""


@pytest.mark.asyncio
async def test_list_hides_premium_url_expired_member(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    """Expired member must NOT receive premium URL."""
    from tests.conftest import MockUser, MockVideo, MockMembership
    from app.schemas.video import VideoResponse

    user = MockUser()
    expired_membership = MockMembership(is_active=False, days_remaining=-10)

    premium_video = MockVideo(is_premium=True)
    premium_video.cloudinary_url = "https://res.cloudinary.com/secret/premium.mp4"

    fake_resp = VideoResponse(
        id=premium_video.id, title=premium_video.title, slug=premium_video.slug,
        cloudinary_url=premium_video.cloudinary_url, is_premium=True, view_count=0,
        created_at=premium_video.created_at,
    )

    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user
    count_result = MagicMock()
    count_result.scalar.return_value = 1
    list_result = MagicMock()
    list_result.scalars.return_value.unique.return_value.all.return_value = [premium_video]
    # The SQL filters for is_active == True AND end_date > now, so expired
    # memberships are excluded at DB level. Mock returns None (no matching row).
    no_membership_result = MagicMock()
    no_membership_result.scalar_one_or_none.return_value = None
    mock_db.execute.side_effect = [user_result, count_result, list_result, no_membership_result]

    with patch.object(VideoResponse, "model_validate", return_value=fake_resp):
        response = await async_client.get("/api/v1/videos", headers=auth_headers)

    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cloudinary_url"] == ""


@pytest.mark.asyncio
async def test_list_shows_premium_url_active_member(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    """Active member MUST receive the real premium URL."""
    from tests.conftest import MockUser, MockVideo, MockMembership
    from app.schemas.video import VideoResponse

    user = MockUser()
    active_membership = MockMembership(is_active=True, days_remaining=60)

    premium_video = MockVideo(is_premium=True)
    real_url = "https://res.cloudinary.com/secret/premium.mp4"
    premium_video.cloudinary_url = real_url

    fake_resp = VideoResponse(
        id=premium_video.id, title=premium_video.title, slug=premium_video.slug,
        cloudinary_url=real_url, is_premium=True, view_count=0,
        created_at=premium_video.created_at,
    )

    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user
    count_result = MagicMock()
    count_result.scalar.return_value = 1
    list_result = MagicMock()
    list_result.scalars.return_value.unique.return_value.all.return_value = [premium_video]
    membership_result = MagicMock()
    membership_result.scalar_one_or_none.return_value = active_membership
    mock_db.execute.side_effect = [user_result, count_result, list_result, membership_result]

    with patch.object(VideoResponse, "model_validate", return_value=fake_resp):
        response = await async_client.get("/api/v1/videos", headers=auth_headers)

    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cloudinary_url"] == real_url


@pytest.mark.asyncio
async def test_list_shows_premium_url_admin(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    """Admin MUST receive the real premium URL."""
    from tests.conftest import MockUser, MockVideo
    from app.schemas.video import VideoResponse

    admin_user = MockUser(is_admin=True)
    premium_video = MockVideo(is_premium=True)
    real_url = "https://res.cloudinary.com/secret/premium.mp4"
    premium_video.cloudinary_url = real_url

    fake_resp = VideoResponse(
        id=premium_video.id, title=premium_video.title, slug=premium_video.slug,
        cloudinary_url=real_url, is_premium=True, view_count=0,
        created_at=premium_video.created_at,
    )

    # Admin: 1=user lookup, 2=video count, 3=video list
    # _has_premium_access returns True for admin without DB call
    admin_result = MagicMock()
    admin_result.scalar_one_or_none.return_value = admin_user
    count_result = MagicMock()
    count_result.scalar.return_value = 1
    list_result = MagicMock()
    list_result.scalars.return_value.unique.return_value.all.return_value = [premium_video]
    mock_db.execute.side_effect = [admin_result, count_result, list_result]

    with patch.object(VideoResponse, "model_validate", return_value=fake_resp):
        response = await async_client.get("/api/v1/videos", headers=admin_headers)

    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cloudinary_url"] == real_url


@pytest.mark.asyncio
async def test_list_search_hides_premium_url(async_client: AsyncClient, override_get_db, mock_db):
    """Search endpoint must also hide premium URLs from unauthenticated users."""
    from tests.conftest import MockVideo
    from app.schemas.video import VideoResponse

    premium_video = MockVideo(is_premium=True)
    premium_video.title = "Secret Premium Workout"
    premium_video.cloudinary_url = "https://res.cloudinary.com/secret/premium.mp4"

    fake_resp = VideoResponse(
        id=premium_video.id, title=premium_video.title, slug=premium_video.slug,
        cloudinary_url=premium_video.cloudinary_url, is_premium=True, view_count=0,
        created_at=premium_video.created_at,
    )

    count_result = MagicMock()
    count_result.scalar.return_value = 1
    list_result = MagicMock()
    list_result.scalars.return_value.unique.return_value.all.return_value = [premium_video]
    mock_db.execute.side_effect = [count_result, list_result]

    with patch.object(VideoResponse, "model_validate", return_value=fake_resp):
        response = await async_client.get("/api/v1/videos?search=Secret")

    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cloudinary_url"] == ""


@pytest.mark.asyncio
async def test_detail_hides_premium_url_unauthenticated(async_client: AsyncClient, override_get_db, mock_db):
    """Detail endpoint must also hide premium URL from unauthenticated users."""
    from tests.conftest import MockVideo

    premium_video = MockVideo(is_premium=True)
    premium_video.cloudinary_url = "https://res.cloudinary.com/secret/premium.mp4"

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = premium_video
    mock_db.execute.return_value = mock_result

    response = await async_client.get(f"/api/v1/videos/{premium_video.slug}")

    assert response.status_code == 200
    data = response.json()
    assert data["is_premium"] is True
    assert data["cloudinary_url"] == ""
    assert "Premium content" in data["description"]


@pytest.mark.asyncio
async def test_free_video_url_always_visible(async_client: AsyncClient, override_get_db, mock_db):
    """Free videos must always show their URL regardless of auth status."""
    from tests.conftest import MockVideo

    free_video = MockVideo(is_premium=False)
    real_url = "https://res.cloudinary.com/public/free.mp4"
    free_video.cloudinary_url = real_url

    count_result = MagicMock()
    count_result.scalar.return_value = 1
    list_result = MagicMock()
    list_result.scalars.return_value.unique.return_value.all.return_value = [free_video]
    mock_db.execute.side_effect = [count_result, list_result]

    response = await async_client.get("/api/v1/videos")

    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cloudinary_url"] == real_url


# ── Stripe / payment flow tests ──────────────────────────────────


@pytest.mark.asyncio
async def test_membership_status_requires_auth(async_client: AsyncClient):
    """Membership status endpoint requires authentication."""
    response = await async_client.get("/api/v1/membership/status")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_membership_status_no_membership(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    """User without membership gets is_active=False."""
    from tests.conftest import MockUser
    user = MockUser()
    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user
    membership_result = MagicMock()
    membership_result.scalar_one_or_none.return_value = None
    mock_db.execute.side_effect = [user_result, membership_result]

    response = await async_client.get("/api/v1/membership/status", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is False


@pytest.mark.asyncio
async def test_membership_status_active(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    """Active member gets is_active=True with days remaining."""
    from tests.conftest import MockUser, MockMembership
    user = MockUser()
    membership = MockMembership(is_active=True, days_remaining=60)
    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user
    membership_result = MagicMock()
    membership_result.scalar_one_or_none.return_value = membership
    mock_db.execute.side_effect = [user_result, membership_result]

    response = await async_client.get("/api/v1/membership/status", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is True
    assert data["days_remaining"] is not None
    assert data["days_remaining"] > 0


@pytest.mark.asyncio
async def test_create_checkout_requires_auth(async_client: AsyncClient):
    """Checkout creation requires authentication."""
    response = await async_client.post("/api/v1/membership/create-checkout")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_checkout_rejects_active_member(
    async_client: AsyncClient, override_get_db, mock_db, auth_headers
):
    """Active member cannot create a new checkout."""
    from tests.conftest import MockUser, MockMembership
    user = MockUser()
    active_membership = MockMembership(is_active=True, days_remaining=60)

    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user
    membership_result = MagicMock()
    membership_result.scalar_one_or_none.return_value = active_membership
    mock_db.execute.side_effect = [user_result, membership_result]

    response = await async_client.post(
        "/api/v1/membership/create-checkout", headers=auth_headers
    )
    assert response.status_code == 400
    assert "active membership" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_payment_history_requires_auth(async_client: AsyncClient):
    """Payment history requires authentication."""
    response = await async_client.get("/api/v1/membership/payments")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_payment_history_empty_for_new_user(
    async_client: AsyncClient, override_get_db, mock_db, auth_headers
):
    """New user has empty payment history."""
    from tests.conftest import MockUser
    user = MockUser()
    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = user
    payments_result = MagicMock()
    payments_result.scalars.return_value.all.return_value = []
    mock_db.execute.side_effect = [user_result, payments_result]

    response = await async_client.get("/api/v1/membership/payments", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []
