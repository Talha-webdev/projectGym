import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from app.schemas.gallery import GalleryResponse
from app.schemas.video import VideoResponse
from app.services.blog_service import BlogService
from app.services.gallery_service import GalleryService
from app.services.video_service import VideoService
from tests.conftest import MockBlog, MockGallery, MockUser, MockVideo


def _admin_result(admin_user: MockUser) -> MagicMock:
    result = MagicMock()
    result.scalar_one_or_none.return_value = admin_user
    return result


def _slug_result() -> MagicMock:
    result = MagicMock()
    result.scalar_one_or_none.return_value = None
    return result


def _fake_video_response() -> VideoResponse:
    return VideoResponse(
        id=str(uuid.uuid4()),
        title="Workout Video",
        slug="workout-video",
        cloudinary_url="https://res.cloudinary.com/demo/video/upload/v1/videos/abc.mp4",
        is_premium=False,
        view_count=0,
        created_at=datetime.now(timezone.utc),
    )


def _fake_gallery_response() -> GalleryResponse:
    return GalleryResponse(
        id=str(uuid.uuid4()),
        title="Gym Photo",
        cloudinary_url="https://res.cloudinary.com/demo/image/upload/v1/gallery/abc.jpg",
        sort_order=0,
    )


# --------------------------------------------------------------------------- #
# Upload endpoints
# --------------------------------------------------------------------------- #


@pytest.mark.asyncio
async def test_admin_video_upload_success(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    admin_user = MockUser(is_admin=True)
    mock_db.execute.side_effect = [_admin_result(admin_user), _slug_result()]

    files = {"file": ("workout.mp4", b"fake-video-bytes", "video/mp4")}
    data = {"title": "Workout Video", "is_premium": "false"}

    with (
        patch(
            "app.api.uploads.upload_video",
            new_callable=AsyncMock,
            return_value={
                "public_id": "videos/abc",
                "secure_url": "https://res.cloudinary.com/demo/video/upload/v1/videos/abc.mp4",
                "resource_type": "video",
                "duration": 120,
            },
        ),
        patch.object(VideoResponse, "model_validate", return_value=_fake_video_response()),
    ):
        response = await async_client.post("/api/v1/uploads/video", files=files, data=data, headers=admin_headers)

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Workout Video"
    assert body["cloudinary_url"].endswith("videos/abc.mp4")


@pytest.mark.asyncio
async def test_admin_gallery_upload_success(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    admin_user = MockUser(is_admin=True)
    mock_db.execute.return_value = _admin_result(admin_user)

    files = {"file": ("photo.jpg", b"fake-image-bytes", "image/jpeg")}
    data = {"title": "Gym Photo", "category": "Progress", "sort_order": "1"}

    with (
        patch(
            "app.api.uploads.upload_image",
            new_callable=AsyncMock,
            return_value={
                "public_id": "gallery/abc",
                "secure_url": "https://res.cloudinary.com/demo/image/upload/v1/gallery/abc.jpg",
                "resource_type": "image",
            },
        ),
        patch.object(GalleryResponse, "model_validate", return_value=_fake_gallery_response()),
    ):
        response = await async_client.post("/api/v1/uploads/gallery", files=files, data=data, headers=admin_headers)

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Gym Photo"
    assert body["cloudinary_url"].endswith("gallery/abc.jpg")


@pytest.mark.asyncio
async def test_admin_blog_cover_upload_success(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    admin_user = MockUser(is_admin=True)
    mock_db.execute.return_value = _admin_result(admin_user)

    files = {"file": ("cover.jpg", b"fake-cover-bytes", "image/jpeg")}

    with patch(
        "app.api.uploads.upload_image",
        new_callable=AsyncMock,
        return_value={
            "public_id": "blog_covers/abc",
            "secure_url": "https://res.cloudinary.com/demo/image/upload/v1/blog_covers/abc.jpg",
            "resource_type": "image",
        },
    ):
        response = await async_client.post("/api/v1/uploads/blog-cover", files=files, headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["cover_image_url"].endswith("blog_covers/abc.jpg")
    assert body["public_id"] == "blog_covers/abc"


@pytest.mark.asyncio
async def test_admin_thumbnail_upload_success(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    admin_user = MockUser(is_admin=True)
    mock_db.execute.return_value = _admin_result(admin_user)

    files = {"file": ("thumb.jpg", b"fake-thumb-bytes", "image/jpeg")}

    with patch(
        "app.api.uploads.upload_image",
        new_callable=AsyncMock,
        return_value={
            "public_id": "video_thumbnails/abc",
            "secure_url": "https://res.cloudinary.com/demo/image/upload/v1/video_thumbnails/abc.jpg",
            "resource_type": "image",
        },
    ):
        response = await async_client.post("/api/v1/uploads/thumbnail", files=files, headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["thumbnail_url"].endswith("video_thumbnails/abc.jpg")


@pytest.mark.asyncio
async def test_upload_unauthorized(async_client: AsyncClient):
    files = {"file": ("workout.mp4", b"fake-video-bytes", "video/mp4")}
    data = {"title": "Workout Video"}
    response = await async_client.post("/api/v1/uploads/video", files=files, data=data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_upload_non_admin_forbidden(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    user = MockUser(is_admin=False)
    mock_db.execute.return_value = _admin_result(user)

    files = {"file": ("photo.jpg", b"fake-image-bytes", "image/jpeg")}
    data = {"title": "Gym Photo"}
    response = await async_client.post("/api/v1/uploads/gallery", files=files, data=data, headers=auth_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_upload_invalid_file_type(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    admin_user = MockUser(is_admin=True)
    mock_db.execute.return_value = _admin_result(admin_user)

    files = {"file": ("notes.txt", b"plain text", "text/plain")}
    data = {"title": "Gym Photo"}
    response = await async_client.post("/api/v1/uploads/gallery", files=files, data=data, headers=admin_headers)
    assert response.status_code == 415


@pytest.mark.asyncio
async def test_upload_oversized_image(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    admin_user = MockUser(is_admin=True)
    mock_db.execute.return_value = _admin_result(admin_user)

    files = {"file": ("big.jpg", b"x" * 100, "image/jpeg")}
    data = {"title": "Gym Photo"}

    with patch("app.api.uploads.MAX_IMAGE_SIZE_BYTES", 10):
        response = await async_client.post("/api/v1/uploads/gallery", files=files, data=data, headers=admin_headers)

    assert response.status_code == 413


# --------------------------------------------------------------------------- #
# Delete endpoints clean up Cloudinary assets
# --------------------------------------------------------------------------- #


@pytest.mark.asyncio
async def test_delete_video_destroys_cloud_asset(mock_db):
    video = MockVideo()
    video.cloudinary_public_id = "videos/abc"
    video.thumbnail_url = "https://res.cloudinary.com/demo/image/upload/v1/video_thumbnails/thumb.jpg"

    result = MagicMock()
    result.scalar_one_or_none.return_value = video
    mock_db.execute.return_value = result

    with patch(
        "app.services.video_service.destroy_asset", new_callable=AsyncMock, return_value=True
    ) as destroy:
        deleted = await VideoService(mock_db).delete("test-video")

    assert deleted is True
    assert destroy.call_count == 2
    destroy.assert_any_await("videos/abc", resource_type="video")
    destroy.assert_any_await("video_thumbnails/thumb", resource_type="image")


@pytest.mark.asyncio
async def test_delete_gallery_destroys_cloud_asset(mock_db):
    gallery = MockGallery()
    gallery.cloudinary_public_id = "gallery/abc"

    result = MagicMock()
    result.scalar_one_or_none.return_value = gallery
    mock_db.execute.return_value = result

    with patch(
        "app.services.gallery_service.destroy_asset", new_callable=AsyncMock, return_value=True
    ) as destroy:
        deleted = await GalleryService(mock_db).delete(str(gallery.id))

    assert deleted is True
    destroy.assert_awaited_once_with("gallery/abc", resource_type="image")


@pytest.mark.asyncio
async def test_delete_blog_destroys_cloud_cover(mock_db):
    blog = MockBlog()
    blog.cover_image_url = "https://res.cloudinary.com/demo/image/upload/v1/blog_covers/cover.jpg"

    result = MagicMock()
    result.scalar_one_or_none.return_value = blog
    mock_db.execute.return_value = result

    with patch(
        "app.services.blog_service.destroy_asset", new_callable=AsyncMock, return_value=True
    ) as destroy:
        deleted = await BlogService(mock_db).delete("test-blog")

    assert deleted is True
    destroy.assert_awaited_once_with("blog_covers/cover", resource_type="image")


@pytest.mark.asyncio
async def test_update_blog_destroys_replaced_cover(mock_db):
    from app.schemas.blog import BlogUpdateRequest

    blog = MockBlog()
    blog.cover_image_url = "https://res.cloudinary.com/demo/image/upload/v1/blog_covers/old.jpg"

    result = MagicMock()
    result.scalar_one_or_none.return_value = blog
    mock_db.execute.return_value = result

    with (
        patch(
            "app.services.blog_service.destroy_asset", new_callable=AsyncMock, return_value=True
        ) as destroy,
        patch.object(BlogService, "_to_detail_response", return_value=None),
    ):
        await BlogService(mock_db).update(
            "test-blog",
            BlogUpdateRequest(cover_image_url="https://res.cloudinary.com/demo/image/upload/v1/blog_covers/new.jpg"),
        )

    destroy.assert_awaited_once_with("blog_covers/old", resource_type="image")


@pytest.mark.asyncio
async def test_admin_delete_video_http(async_client: AsyncClient, override_get_db, mock_db, admin_headers):
    admin_user = MockUser(is_admin=True)
    video = MockVideo()

    video_result = MagicMock()
    video_result.scalar_one_or_none.return_value = video
    mock_db.execute.side_effect = [_admin_result(admin_user), video_result]

    with patch("app.services.video_service.destroy_asset", new_callable=AsyncMock, return_value=True):
        response = await async_client.delete("/api/v1/videos/test-video", headers=admin_headers)

    assert response.status_code == 204


# --------------------------------------------------------------------------- #
# parse_public_id helper
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    "url,expected",
    [
        ("https://res.cloudinary.com/demo/image/upload/v1710000000/blog_covers/abc.jpg", "blog_covers/abc"),
        ("https://res.cloudinary.com/demo/video/upload/v1710000000/videos/movie.mp4", "videos/movie"),
        ("https://res.cloudinary.com/demo/image/upload/blog_covers/abc.jpg", "blog_covers/abc"),
        ("https://external.com/x.jpg", None),
        (None, None),
        ("", None),
    ],
)
def test_parse_public_id(url, expected):
    from app.services.cloudinary_service import parse_public_id

    assert parse_public_id(url) == expected