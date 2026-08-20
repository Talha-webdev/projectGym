import uuid
from pydantic import BaseModel, field_validator
from typing import Optional
from decimal import Decimal
from datetime import datetime


class DashboardResponse(BaseModel):
    total_users: int
    active_members: int
    total_revenue: Decimal
    revenue_this_month: Decimal
    total_videos: int
    total_blogs: int
    total_gallery: int


class AdminUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    is_admin: bool
    is_verified: bool
    membership_status: Optional[str] = None
    membership_end: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MembershipActionRequest(BaseModel):
    action: str
    days: Optional[int] = None

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        allowed = {"activate", "deactivate", "extend"}
        if v not in allowed:
            raise ValueError(f"Action must be one of: {', '.join(sorted(allowed))}")
        return v

    @field_validator("days")
    @classmethod
    def validate_days(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            if v < 1:
                raise ValueError("Days must be at least 1")
            if v > 3650:
                raise ValueError("Days must be at most 3650")
        return v


class AdminPaymentResponse(BaseModel):
    id: uuid.UUID
    user_email: str
    user_name: str
    amount: Decimal
    currency: str
    status: str
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
