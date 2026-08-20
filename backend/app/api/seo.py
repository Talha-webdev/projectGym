from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.seo_service import SEOService, build_sitemap_xml, ROBOTS_TXT

router = APIRouter(tags=["seo"])


@router.get("/sitemap.xml", response_class=Response, include_in_schema=False)
async def sitemap(db: AsyncSession = Depends(get_db)):
    service = SEOService(db)
    urls = await service.get_sitemap_urls()
    xml = build_sitemap_xml(urls)
    return Response(content=xml, media_type="application/xml")


@router.get("/robots.txt", response_class=PlainTextResponse, include_in_schema=False)
async def robots():
    return PlainTextResponse(ROBOTS_TXT)
