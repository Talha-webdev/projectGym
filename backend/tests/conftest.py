import asyncio
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.utils.security import create_access_token


class MockUser:
    def __init__(self, is_admin: bool = False):
        self.id = str(uuid.uuid4())
        self.email = "test@example.com"
        self.password_hash = "$2b$12$dummyhash"
        self.full_name = "Test User"
        self.avatar_url = None
        self.is_admin = is_admin
        self.is_verified = True
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)


class MockVideo:
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.title = "Test Video"
        self.slug = "test-video"
        self.description = "A test video description"
        self.cloudinary_public_id = "test/public"
        self.cloudinary_url = "https://res.cloudinary.com/test/video.mp4"
        self.thumbnail_url = "https://res.cloudinary.com/test/thumb.jpg"
        self.duration = 300
        self.view_count = 0
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        self.categories = []


class MockBlog:
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.title = "Test Blog"
        self.slug = "test-blog"
        self.content = "Test content"
        self.excerpt = "Test excerpt"
        self.cover_image_url = "https://res.cloudinary.com/test/cover.jpg"
        self.read_time_minutes = 5
        self.meta_description = "Test meta"
        self.view_count = 0
        self.published_at = datetime.now(timezone.utc)
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        self.tags = []


class MockComment:
    def __init__(self, user_id: str = None, video_id: str = None, blog_id: str = None):
        self.id = str(uuid.uuid4())
        self.user_id = user_id or str(uuid.uuid4())
        self.video_id = video_id
        self.blog_id = blog_id
        self.parent_id = None
        self.content = "Test comment"
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)


class MockGallery:
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.title = "Test Image"
        self.cloudinary_public_id = "test/gallery"
        self.cloudinary_url = "https://res.cloudinary.com/test/image.jpg"
        self.category = "Progress"
        self.sort_order = 0
        self.created_at = datetime.now(timezone.utc)


@pytest.fixture(autouse=True)
def patch_db_engine():
    import app.database
    mock_engine = MagicMock()
    mock_engine.begin = MagicMock()
    mock_engine.dispose = MagicMock()
    mock_engine.connect = MagicMock()
    mock_session_factory = MagicMock()
    mock_session = MagicMock()
    mock_session_factory.return_value = mock_session
    mock_session.__aenter__.return_value = mock_session
    async def mock_close():
        pass
    mock_session.close = mock_close
    with (
        patch.object(app.database, "engine", mock_engine),
        patch.object(app.database, "async_session_factory", mock_session_factory),
        patch("app.database.Base.metadata.create_all"),
    ):
        yield


@pytest.fixture
def mock_db():
    db = MagicMock()
    db.execute = AsyncMock()
    db.get = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.close = AsyncMock()
    db.flush = AsyncMock()
    db.add = MagicMock()
    db.delete = AsyncMock()
    return db


@pytest.fixture
def override_get_db(mock_db):
    from app.database import get_db
    async def _override():
        yield mock_db
    app.dependency_overrides[get_db] = _override
    yield
    app.dependency_overrides.pop(get_db, None)


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def test_user():
    return MockUser()


@pytest.fixture
def admin_user():
    return MockUser(is_admin=True)


@pytest.fixture
def user_token(test_user):
    return create_access_token({"sub": str(test_user.id)})


@pytest.fixture
def admin_token(admin_user):
    return create_access_token({"sub": str(admin_user.id)})


@pytest.fixture
def auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
