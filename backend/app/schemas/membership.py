from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MembershipStatusResponse(BaseModel):
    is_active: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    days_remaining: Optional[int] = None

    model_config = {"from_attributes": True}


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
