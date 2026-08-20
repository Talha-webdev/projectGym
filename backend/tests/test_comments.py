import uuid
import pytest
from unittest.mock import MagicMock, AsyncMock
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_video_comments(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockComment
    video_id = str(uuid.uuid4())
    comments = [MockComment(video_id=video_id)]
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = comments
    mock_result.scalar.return_value = 1
    mock_db.execute.return_value = mock_result
    response = await async_client.get(f"/api/v1/comments/video/{video_id}")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.asyncio
async def test_get_blog_comments(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockComment
    blog_id = str(uuid.uuid4())
    comments = [MockComment(blog_id=blog_id)]
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = comments
    mock_result.scalar.return_value = 1
    mock_db.execute.return_value = mock_result
    response = await async_client.get(f"/api/v1/comments/blog/{blog_id}")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.asyncio
async def test_create_comment_no_auth(async_client: AsyncClient):
    payload = {
        "content": "Great post!",
        "video_id": str(uuid.uuid4()),
    }
    response = await async_client.post("/api/v1/comments", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_comment_not_found(async_client: AsyncClient, override_get_db, mock_db, auth_headers):
    from tests.conftest import MockUser
    user = MockUser()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user
    mock_db.execute.return_value = mock_result
    mock_db.get.return_value = None
    comment_id = str(uuid.uuid4())
    response = await async_client.delete(f"/api/v1/comments/{comment_id}", headers=auth_headers)
    assert response.status_code == 404
