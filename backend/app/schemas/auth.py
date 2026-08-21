import re
from pydantic import BaseModel, EmailStr, field_validator
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
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

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Full name is required")
        if len(v) > 100:
            raise ValueError("Full name must be at most 100 characters")
        if not re.match(r"^[a-zA-Z0-9\s\-'.\u00C0-\u024F]+$", v):
            raise ValueError("Full name contains invalid characters")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    token: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
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
