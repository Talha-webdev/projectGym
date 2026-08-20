import re
import uuid
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    is_admin: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) < 1:
                raise ValueError("Full name cannot be empty")
            if len(v) > 100:
                raise ValueError("Full name must be at most 100 characters")
            if not re.match(r"^[a-zA-Z0-9\s\-'.\u00C0-\u024F]+$", v):
                raise ValueError("Full name contains invalid characters")
        return v.strip() if v else v

    @field_validator("avatar_url")
    @classmethod
    def validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() and not v.startswith(("https://", "http://")):
            raise ValueError("Avatar URL must start with http:// or https://")
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        errors = []
        if len(v) < 8:
            errors.append("At least 8 characters")
        if len(v) > 128:
            errors.append("At most 128 characters")
        if not re.search(r"[A-Z]", v):
            errors.append("One uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("One lowercase letter")
        if not re.search(r"[0-9]", v):
            errors.append("One number")
        if errors:
            raise ValueError("; ".join(errors))
        return v
