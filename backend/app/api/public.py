from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.public_service import PublicService
from app.schemas.website_settings import WebsiteSettingsResponse

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/journey")
async def get_journey(db: AsyncSession = Depends(get_db)):
    service = PublicService(db)
    return await service.get_journey()


@router.get("/statistics")
async def get_statistics(db: AsyncSession = Depends(get_db)):
    service = PublicService(db)
    return await service.get_statistics()


@router.get("/faq")
async def get_faq(db: AsyncSession = Depends(get_db)):
    service = PublicService(db)
    return await service.get_faq()


@router.get("/website-settings", response_model=WebsiteSettingsResponse)
async def get_website_settings(db: AsyncSession = Depends(get_db)):
    service = PublicService(db)
    settings = await service.get_site_settings()
    return WebsiteSettingsResponse(settings=settings)