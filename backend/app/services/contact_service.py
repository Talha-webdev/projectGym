from app.schemas.contact import ContactRequest


async def submit_contact(request: ContactRequest) -> None:
    # TODO: Send email notification to admin
    # TODO: Store in database if needed
    pass
