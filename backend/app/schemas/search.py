import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SearchResultItem(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    source_type: str
    thumbnail_url: Optional[str] = None
    excerpt: Optional[str] = None
    created_at: datetime


class SearchResponse(BaseModel):
    items: list[SearchResultItem]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool
