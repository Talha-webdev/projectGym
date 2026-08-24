import uuid
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class BlogResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    read_time_minutes: Optional[int] = None
    view_count: int
    published_at: Optional[datetime] = None
    created_at: datetime
    tags: list[str] = []

    model_config = {"from_attributes": True}


class BlogDetailResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    read_time_minutes: Optional[int] = None
    meta_description: Optional[str] = None
    view_count: int
    published_at: Optional[datetime] = None
    created_at: datetime
    tags: list[str] = []

    model_config = {"from_attributes": True}


class BlogCreateRequest(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    meta_description: Optional[str] = None
    tag_ids: Optional[list[str]] = None
    published: bool = False

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Title is required")
        if len(v) > 200:
            raise ValueError("Title must be at most 200 characters")
        return v.strip()

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Content is required")
        if len(v) > 100000:
            raise ValueError("Content must be at most 100000 characters")
        return v.strip()

    @field_validator("excerpt")
    @classmethod
    def validate_excerpt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 500:
            raise ValueError("Excerpt must be at most 500 characters")
        return v

    @field_validator("meta_description")
    @classmethod
    def validate_meta_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 300:
            raise ValueError("Meta description must be at most 300 characters")
        return v


class BlogUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    meta_description: Optional[str] = None
    tag_ids: Optional[list[str]] = None
    published: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) < 1:
                raise ValueError("Title cannot be empty")
            if len(v) > 200:
                raise ValueError("Title must be at most 200 characters")
        return v.strip() if v else v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 100000:
            raise ValueError("Content must be at most 100000 characters")
        return v

    @field_validator("excerpt")
    @classmethod
    def validate_excerpt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 500:
            raise ValueError("Excerpt must be at most 500 characters")
        return v


class TagResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str

    model_config = {"from_attributes": True}
