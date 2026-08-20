import uuid
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TestimonialResponse(BaseModel):
    id: uuid.UUID
    name: str
    role: Optional[str] = None
    content: str
    avatar_url: Optional[str] = None
    sort_order: int = 0

    model_config = {"from_attributes": True}


class JourneyItemResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    milestone_type: Optional[str] = None
    value: Optional[str] = None
    sort_order: int = 0

    model_config = {"from_attributes": True}


class SiteSettingResponse(BaseModel):
    key: str
    value: str

    model_config = {"from_attributes": True}


class SiteSettingsMap(BaseModel):
    settings: dict[str, str]