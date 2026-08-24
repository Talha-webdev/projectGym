import uuid
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DashboardResponse(BaseModel):
    total_users: int
    total_videos: int
    total_blogs: int
    total_gallery: int


class AdminUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    is_admin: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminCommentResponse(BaseModel):
    id: uuid.UUID
    user_email: str
    user_name: str
    content: str
    source_type: Optional[str] = None
    source_title: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
