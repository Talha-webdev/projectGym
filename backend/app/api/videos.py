from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_admin, get_optional_user
from app.models.user import User
from app.services.video_service import VideoService
from app.schemas.video import (
    VideoResponse,
    VideoCreateRequest,
    VideoUpdateRequest,
    CategoryResponse,
)
from app.models.category import Category

router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("")
async def list_videos(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    category: str | None = Query(None, description="Category slug"),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = VideoService(db)
    return await service.get_list(
        page=page,
        per_page=per_page,
        category_slug=category,
        search=search,
    )


@router.get("/categories/list", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.name))
    return [CategoryResponse.model_validate(c) for c in result.scalars().all()]


@router.get("/{slug}")
async def get_video(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    service = VideoService(db)
    video = await service.get_by_slug(slug)
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    await service.increment_view_count(video)
    return service._to_response(video)


@router.post("", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def create_video(
    request: VideoCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = VideoService(db)
    return await service.create(request)


@router.patch("/{slug}", response_model=VideoResponse)
async def update_video(
    slug: str,
    request: VideoUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = VideoService(db)
    video = await service.update(slug, request)
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    return video


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    slug: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = VideoService(db)
    deleted = await service.delete(slug)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
