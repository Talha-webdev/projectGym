from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.services.blog_service import BlogService
from app.schemas.blog import (
    BlogResponse,
    BlogDetailResponse,
    BlogCreateRequest,
    BlogUpdateRequest,
    TagResponse,
)
from app.models.tag import Tag

router = APIRouter(prefix="/blogs", tags=["blogs"])


@router.get("")
async def list_blogs(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    tag: str | None = Query(None, description="Tag slug"),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = BlogService(db)
    return await service.get_list(
        page=page,
        per_page=per_page,
        tag_slug=tag,
        search=search,
    )


@router.get("/tags/list", response_model=list[TagResponse])
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).order_by(Tag.name))
    return [TagResponse.model_validate(t) for t in result.scalars().all()]


@router.get("/{slug}")
async def get_blog(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    service = BlogService(db)
    blog = await service.get_by_slug(slug)
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found")
    await service.increment_view_count(blog)
    return service._to_detail_response(blog)


@router.post("", response_model=BlogDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_blog(
    request: BlogCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = BlogService(db)
    return await service.create(request)


@router.patch("/{slug}", response_model=BlogDetailResponse)
async def update_blog(
    slug: str,
    request: BlogUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = BlogService(db)
    blog = await service.update(slug, request)
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found")
    return blog


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(
    slug: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = BlogService(db)
    deleted = await service.delete(slug)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found")
