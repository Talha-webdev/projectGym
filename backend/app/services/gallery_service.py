from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.gallery import Gallery
from app.utils.pagination import PaginationParams, paginate
from app.schemas.gallery import GalleryResponse


class GalleryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_list(
        self,
        page: int = 1,
        per_page: int = 12,
        category: str | None = None,
    ) -> dict:
        query = select(Gallery)
        if category:
            query = query.filter(Gallery.category == category)

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        params = PaginationParams(page, per_page)
        query = query.order_by(Gallery.sort_order.asc(), Gallery.created_at.desc()).offset(params.offset).limit(params.limit)
        result = await self.db.execute(query)
        items = result.scalars().all()

        return paginate(
            [GalleryResponse.model_validate(g) for g in items],
            total,
            params,
        ).model_dump()

    async def get_categories(self) -> list[str]:
        from sqlalchemy import distinct
        result = await self.db.execute(
            select(distinct(Gallery.category)).where(Gallery.category.isnot(None)).order_by(Gallery.category)
        )
        return [row[0] for row in result.all()]

    async def create(self, request) -> GalleryResponse:
        gallery = Gallery(
            title=request.title,
            cloudinary_public_id=request.cloudinary_public_id,
            cloudinary_url=request.cloudinary_url,
            category=request.category,
            sort_order=request.sort_order,
        )
        self.db.add(gallery)
        await self.db.commit()
        await self.db.refresh(gallery)
        return GalleryResponse.model_validate(gallery)

    async def update(self, item_id: str, request) -> GalleryResponse | None:
        from uuid import UUID
        result = await self.db.execute(select(Gallery).where(Gallery.id == UUID(item_id)))
        gallery = result.scalar_one_or_none()
        if not gallery:
            return None
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(gallery, key, value)
        await self.db.commit()
        await self.db.refresh(gallery)
        return GalleryResponse.model_validate(gallery)

    async def delete(self, item_id: str) -> bool:
        from uuid import UUID
        result = await self.db.execute(select(Gallery).where(Gallery.id == UUID(item_id)))
        gallery = result.scalar_one_or_none()
        if not gallery:
            return False
        await self.db.delete(gallery)
        await self.db.commit()
        return True
