import pytest
from unittest.mock import MagicMock
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_blogs(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockBlog
    blogs = [MockBlog(), MockBlog()]
    mock_result = MagicMock()
    mock_result.scalars.return_value.unique.return_value.all.return_value = blogs
    mock_result.scalar.return_value = 2
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/blogs")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_get_blog_by_slug(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockBlog
    blog = MockBlog()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = blog
    mock_db.execute.return_value = mock_result
    response = await async_client.get(f"/api/v1/blogs/{blog.slug}")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == blog.slug
    assert data["title"] == blog.title


@pytest.mark.asyncio
async def test_get_blog_not_found(async_client: AsyncClient, override_get_db, mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/blogs/non-existent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_tags(async_client: AsyncClient, override_get_db, mock_db):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/blogs/tags/list")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
