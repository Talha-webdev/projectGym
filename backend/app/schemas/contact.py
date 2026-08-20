from pydantic import BaseModel, EmailStr, field_validator


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Name is required")
        if len(v) > 200:
            raise ValueError("Name must be at most 200 characters")
        return v.strip()

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Subject is required")
        if len(v) > 500:
            raise ValueError("Subject must be at most 500 characters")
        return v.strip()

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Message is required")
        if len(v) > 10000:
            raise ValueError("Message must be at most 10000 characters")
        return v.strip()


class ContactResponse(BaseModel):
    message: str = "Thank you for your message. We'll get back to you soon."
