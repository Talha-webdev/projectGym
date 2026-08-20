import uuid
from pydantic import BaseModel, field_validator
from typing import Optional


class GalleryResponse(BaseModel):
    id: uuid.UUID
    title: Optional[str] = None
    cloudinary_url: str
    category: Optional[str] = None
    sort_order: int

    model_config = {"from_attributes": True}


class GalleryCreateRequest(BaseModel):
    title: Optional[str] = None
    cloudinary_public_id: str
    cloudinary_url: str
    category: Optional[str] = None
    sort_order: int = 0

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 200:
            raise ValueError("Title must be at most 200 characters")
        return v

    @field_validator("cloudinary_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("https://", "http://", "cloudinary://")):
            raise ValueError("Invalid cloudinary URL")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 100:
            raise ValueError("Category must be at most 100 characters")
        return v

    @field_validator("sort_order")
    @classmethod
    def validate_sort_order(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Sort order must be non-negative")
        if v > 9999:
            raise ValueError("Sort order must be at most 9999")
        return v


class GalleryUpdateRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    sort_order: Optional[int] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 200:
            raise ValueError("Title must be at most 200 characters")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 100:
            raise ValueError("Category must be at most 100 characters")
        return v

    @field_validator("sort_order")
    @classmethod
    def validate_sort_order(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            if v < 0:
                raise ValueError("Sort order must be non-negative")
            if v > 9999:
                raise ValueError("Sort order must be at most 9999")
        return v
