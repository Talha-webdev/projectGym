from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.services.gallery_service import GalleryService
from app.schemas.gallery import GalleryResponse, GalleryCreateRequest, GalleryUpdateRequest

router = APIRouter(prefix="/gallery", tags=["gallery"])


@router.get("")
async def list_gallery(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = GalleryService(db)
    return await service.get_list(page=page, per_page=per_page, category=category)


@router.get("/categories", response_model=list[str])
async def list_categories(db: AsyncSession = Depends(get_db)):
    service = GalleryService(db)
    return await service.get_categories()


@router.post("", response_model=GalleryResponse, status_code=status.HTTP_201_CREATED)
async def create_gallery(
    request: GalleryCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = GalleryService(db)
    return await service.create(request)


@router.patch("/{item_id}", response_model=GalleryResponse)
async def update_gallery(
    item_id: str,
    request: GalleryUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = GalleryService(db)
    gallery = await service.update(item_id, request)
    if not gallery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
    return gallery


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = GalleryService(db)
    deleted = await service.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
