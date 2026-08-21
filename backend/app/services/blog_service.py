from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.blog import Blog
from app.models.tag import Tag
from app.utils.pagination import PaginationParams, paginate
from app.schemas.blog import BlogResponse, BlogDetailResponse
from app.services.cloudinary_service import destroy_asset, parse_public_id
from datetime import datetime, timezone


class BlogService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_list(
        self,
        page: int = 1,
        per_page: int = 12,
        tag_slug: str | None = None,
        search: str | None = None,
        premium_only: bool | None = None,
    ) -> dict:
        query = select(Blog).options(selectinload(Blog.tags)).where(Blog.published_at.isnot(None))
        if tag_slug:
            query = query.join(Blog.tags).filter(Blog.tags.any(slug=tag_slug))
        if search:
            query = query.filter(Blog.title.ilike(f"%{search}%"))
        if premium_only is True:
            query = query.filter(Blog.is_premium == True)
        elif premium_only is False:
            query = query.filter(Blog.is_premium == False)

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        params = PaginationParams(page, per_page)
        query = query.order_by(Blog.published_at.desc()).offset(params.offset).limit(params.limit)
        result = await self.db.execute(query)
        blogs = result.scalars().unique().all()

        items = [self._to_response(b) for b in blogs]
        return paginate(items, total, params).model_dump()

    async def get_by_slug(self, slug: str) -> Blog | None:
        result = await self.db.execute(
            select(Blog).options(selectinload(Blog.tags)).where(Blog.slug == slug)
        )
        return result.scalar_one_or_none()

    async def increment_view_count(self, blog: Blog) -> None:
        blog.view_count += 1
        await self.db.commit()

    async def create(self, request) -> BlogDetailResponse:
        import uuid
        slug = request.title.lower().replace(" ", "-").replace("--", "-")
        slug = "".join(c for c in slug if c.isalnum() or c == "-")
        existing = await self.db.execute(select(Blog).where(Blog.slug == slug))
        if existing.scalar_one_or_none():
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"
        blog = Blog(
            title=request.title,
            slug=slug,
            content=request.content,
            excerpt=request.excerpt,
            cover_image_url=request.cover_image_url,
            is_premium=request.is_premium,
            meta_description=request.meta_description,
            read_time_minutes=max(1, len(request.content.split()) // 200) if request.content else None,
            published_at=datetime.now(timezone.utc) if request.published else None,
        )
        self.db.add(blog)
        await self.db.flush()
        if request.tag_ids:
            tags_result = await self.db.execute(select(Tag).where(Tag.id.in_(request.tag_ids)))
            blog.tags = tags_result.scalars().all()
        await self.db.commit()
        await self.db.refresh(blog)
        return self._to_detail_response(blog)

    async def update(self, slug: str, request) -> BlogDetailResponse | None:
        blog = await self.get_by_slug(slug)
        if not blog:
            return None
        update_data = request.model_dump(exclude_unset=True)
        tag_ids = update_data.pop("tag_ids", None)
        published = update_data.pop("published", None)
        old_cover_url = blog.cover_image_url
        for key, value in update_data.items():
            setattr(blog, key, value)
        if "cover_image_url" in update_data and update_data["cover_image_url"] != old_cover_url:
            old_pid = parse_public_id(old_cover_url)
            if old_pid:
                await destroy_asset(old_pid, resource_type="image")
        if published is not None:
            blog.published_at = datetime.now(timezone.utc) if published else None
        if tag_ids is not None:
            tags_result = await self.db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
            blog.tags = tags_result.scalars().all()
        await self.db.commit()
        await self.db.refresh(blog)
        return self._to_detail_response(blog)

    async def delete(self, slug: str) -> bool:
        blog = await self.get_by_slug(slug)
        if not blog:
            return False
        if blog.cover_image_url:
            cover_pid = parse_public_id(blog.cover_image_url)
            if cover_pid:
                await destroy_asset(cover_pid, resource_type="image")
        await self.db.delete(blog)
        await self.db.commit()
        return True

    def _to_response(self, blog: Blog) -> BlogResponse:
        resp = BlogResponse.model_validate(blog)
        resp.tags = [t.name for t in blog.tags]
        return resp

    def _to_detail_response(self, blog: Blog) -> BlogDetailResponse:
        resp = BlogDetailResponse.model_validate(blog)
        resp.tags = [t.name for t in blog.tags]
        return resp
