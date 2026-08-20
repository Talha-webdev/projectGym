import pytest
from unittest.mock import MagicMock
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_gallery(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockGallery
    images = [MockGallery(), MockGallery()]
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = images
    mock_result.scalar.return_value = 2
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/gallery")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_gallery_with_category_filter(async_client: AsyncClient, override_get_db, mock_db):
    from tests.conftest import MockGallery
    images = [MockGallery()]
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = images
    mock_result.scalar.return_value = 1
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/gallery?category=Progress")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_gallery_empty(async_client: AsyncClient, override_get_db, mock_db):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_result.scalar.return_value = 0
    mock_db.execute.return_value = mock_result
    response = await async_client.get("/api/v1/gallery")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 0
