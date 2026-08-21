import logging
from app.schemas.contact import ContactRequest
from app.services.email_service import send_contact_email

logger = logging.getLogger("project_gym")


async def submit_contact(request: ContactRequest) -> None:
    success = await send_contact_email(
        name=request.name,
        email=request.email,
        subject=request.subject,
        message=request.message,
    )
    if not success:
        logger.warning(
            "Contact form submission from %s could not be delivered (email send failed or ADMIN_EMAIL not configured)",
            request.email,
        )
