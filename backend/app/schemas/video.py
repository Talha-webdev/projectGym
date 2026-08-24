import uuid
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class VideoResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    description: Optional[str] = None
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    view_count: int
    category: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class VideoCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    cloudinary_public_id: str
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    category_ids: Optional[list[str]] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Title is required")
        if len(v) > 200:
            raise ValueError("Title must be at most 200 characters")
        return v.strip()

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) > 10000:
                raise ValueError("Description must be at most 10000 characters")
        return v

    @field_validator("cloudinary_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("https://", "http://", "cloudinary://")):
            raise ValueError("Invalid cloudinary URL")
        return v


class VideoUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    category_ids: Optional[list[str]] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) < 1:
                raise ValueError("Title cannot be empty")
            if len(v) > 200:
                raise ValueError("Title must be at most 200 characters")
        return v.strip() if v else v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 10000:
            raise ValueError("Description must be at most 10000 characters")
        return v


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str

    model_config = {"from_attributes": True}
