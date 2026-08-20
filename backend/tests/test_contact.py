import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock

from app.database import get_db


class TestContactAPI:
    @pytest.mark.asyncio
    async def test_submit_contact(self, async_client: AsyncClient, override_get_db, mock_db):
        mock_db.commit = AsyncMock()
        mock_db.add = AsyncMock()
        payload = {
            "name": "John Doe",
            "email": "john@example.com",
            "subject": "Question about membership",
            "message": "I'd like to know more about the 3-month plan.",
        }
        response = await async_client.post("/api/v1/contact", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert "message" in data

    @pytest.mark.asyncio
    async def test_submit_contact_invalid_email(self, async_client: AsyncClient, override_get_db, mock_db):
        payload = {
            "name": "John Doe",
            "email": "not-an-email",
            "subject": "Test",
            "message": "Test message",
        }
        response = await async_client.post("/api/v1/contact", json=payload)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_submit_contact_missing_fields(self, async_client: AsyncClient):
        response = await async_client.post("/api/v1/contact", json={})
        assert response.status_code == 422
