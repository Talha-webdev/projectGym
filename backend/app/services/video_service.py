from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.video import Video
from app.models.category import Category
from app.utils.pagination import PaginationParams, paginate
from app.schemas.video import VideoResponse
from app.services.cloudinary_service import destroy_asset, parse_public_id, ensure_video_playable


class VideoService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_list(
        self,
        page: int = 1,
        per_page: int = 12,
        category_slug: str | None = None,
        search: str | None = None,
    ) -> dict:
        query = select(Video).options(selectinload(Video.categories))
        if category_slug:
            query = query.join(Video.categories).filter(Video.categories.any(slug=category_slug))
        if search:
            query = query.filter(Video.title.ilike(f"%{search}%"))

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        params = PaginationParams(page, per_page)
        query = query.order_by(Video.created_at.desc()).offset(params.offset).limit(params.limit)
        result = await self.db.execute(query)
        videos = result.scalars().unique().all()

        items = [self._to_response(v) for v in videos]
        return paginate(items, total, params).model_dump()

    async def get_by_slug(self, slug: str) -> Video | None:
        result = await self.db.execute(
            select(Video).options(selectinload(Video.categories)).where(Video.slug == slug)
        )
        return result.scalar_one_or_none()

    async def increment_view_count(self, video: Video) -> None:
        video.view_count += 1
        await self.db.commit()

    async def create(self, request) -> VideoResponse:
        import uuid
        slug = request.title.lower().replace(" ", "-").replace("--", "-")
        slug = "".join(c for c in slug if c.isalnum() or c == "-")
        existing = await self.db.execute(select(Video).where(Video.slug == slug))
        if existing.scalar_one_or_none():
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"
        video = Video(
            title=request.title,
            slug=slug,
            description=request.description,
            cloudinary_public_id=request.cloudinary_public_id,
            cloudinary_url=request.cloudinary_url,
            thumbnail_url=request.thumbnail_url,
            duration=request.duration,
        )
        self.db.add(video)
        await self.db.flush()
        if request.category_ids:
            from sqlalchemy import select as sel
            cats = await self.db.execute(
                sel(Category).where(Category.id.in_(request.category_ids))
            )
            video.categories = cats.scalars().all()
            await self.db.flush()
        await self.db.commit()
        video = await self.get_by_slug(slug)
        return self._to_response(video)

    async def update(self, slug: str, request) -> VideoResponse | None:
        video = await self.get_by_slug(slug)
        if not video:
            return None
        update_data = request.model_dump(exclude_unset=True)
        cat_ids = update_data.pop("category_ids", None)
        old_thumbnail = video.thumbnail_url
        for key, value in update_data.items():
            setattr(video, key, value)
        if "thumbnail_url" in update_data and update_data["thumbnail_url"] != old_thumbnail:
            old_pid = parse_public_id(old_thumbnail)
            if old_pid:
                await destroy_asset(old_pid, resource_type="image")
        if cat_ids is not None:
            from sqlalchemy import select as sel
            cats = await self.db.execute(
                sel(Category).where(Category.id.in_(cat_ids))
            )
            video.categories = cats.scalars().all()
        await self.db.commit()
        await self.db.refresh(video)
        return self._to_response(video)

    async def delete(self, slug: str) -> bool:
        video = await self.get_by_slug(slug)
        if not video:
            return False
        if video.cloudinary_public_id:
            await destroy_asset(video.cloudinary_public_id, resource_type="video")
        if video.thumbnail_url:
            thumb_pid = parse_public_id(video.thumbnail_url)
            if thumb_pid:
                await destroy_asset(thumb_pid, resource_type="image")
        await self.db.delete(video)
        await self.db.commit()
        return True

    def _to_response(self, video: Video) -> VideoResponse:
        resp = VideoResponse.model_validate(video)
        resp.cloudinary_url = ensure_video_playable(resp.cloudinary_url)
        resp.category = video.categories[0].name if video.categories else None
        return resp