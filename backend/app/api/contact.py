from fastapi import APIRouter, Depends, Request, status
from app.schemas.contact import ContactRequest, ContactResponse
from app.services.contact_service import submit_contact
from app.utils.rate_limiter import rate_limiter
from app.utils.sanitize import sanitize_input

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def contact_form(
    request: ContactRequest,
    request_http: Request,
):
    await rate_limiter.check(request_http, max_requests=3, window_seconds=300, key_prefix="contact")
    sanitized = ContactRequest(
        name=sanitize_input(request.name, max_length=200),
        email=request.email,
        subject=sanitize_input(request.subject, max_length=500),
        message=sanitize_input(request.message, max_length=10000),
    )
    await submit_contact(sanitized)
    return ContactResponse()
