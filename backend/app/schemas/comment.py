import uuid
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class CommentUser(BaseModel):
    id: uuid.UUID
    full_name: str
    avatar_url: Optional[str] = None


class CommentResponse(BaseModel):
    id: uuid.UUID
    user: CommentUser
    content: str
    parent_id: Optional[uuid.UUID] = None
    created_at: datetime
    replies_count: int = 0

    model_config = {"from_attributes": True}


class CommentCreateRequest(BaseModel):
    content: str
    video_id: Optional[str] = None
    blog_id: Optional[str] = None
    parent_id: Optional[str] = None

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Comment cannot be empty")
        if len(v) > 5000:
            raise ValueError("Comment must be at most 5000 characters")
        return v.strip()


class CommentUpdateRequest(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Comment cannot be empty")
        if len(v) > 5000:
            raise ValueError("Comment must be at most 5000 characters")
        return v.strip()
