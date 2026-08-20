from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.public_service import PublicService

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/site-settings")
async def get_site_settings(db: AsyncSession = Depends(get_db)):
    service = PublicService(db)
    return await service.get_site_settings()


@router.get("/testimonials")
async def get_testimonials(db: AsyncSession = Depends(get_db)):
    service = PublicService(db)
    return await service.get_testimonials()


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