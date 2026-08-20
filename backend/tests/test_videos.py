import uuid
from datetime import datetime, timezone
import pytest
from unittest.mock import MagicMock, AsyncMock
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
