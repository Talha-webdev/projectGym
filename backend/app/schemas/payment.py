import uuid
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime


class PaymentResponse(BaseModel):
    id: uuid.UUID
    amount: Decimal
    currency: str
    status: str
    stripe_session_id: str
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class VerifySessionResponse(BaseModel):
    valid: bool
    status: str
