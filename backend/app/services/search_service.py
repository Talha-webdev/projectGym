from math import ceil
from sqlalchemy import select, union_all, literal, func, String
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.video import Video
from app.models.blog import Blog
from app.models.gallery import Gallery
from app.schemas.search import SearchResultItem, SearchResponse


class SearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search(
        self,
        q: str,
        page: int = 1,
        per_page: int = 12,
    ) -> SearchResponse:
        if not q or not q.strip():
            return SearchResponse(
                items=[], total=0, page=page, per_page=per_page,
                total_pages=0, has_next=False, has_prev=False,
            )

        pattern = f"%{q.strip()}%"

        video_q = (
            select(
                literal("video").label("source_type"),
                Video.id.label("id"),
                Video.title.label("title"),
                Video.slug.label("slug"),
                Video.thumbnail_url.label("thumbnail_url"),
                func.coalesce(Video.description, "").label("excerpt"),
                Video.created_at.label("created_at"),
            )
            .where(
                Video.title.ilike(pattern) | Video.description.ilike(pattern)
            )
        )

        blog_q = (
            select(
                literal("blog").label("source_type"),
                Blog.id.label("id"),
                Blog.title.label("title"),
                Blog.slug.label("slug"),
                Blog.cover_image_url.label("thumbnail_url"),
                func.coalesce(Blog.excerpt, Blog.content).label("excerpt"),
                Blog.created_at.label("created_at"),
            )
            .where(
                Blog.title.ilike(pattern)
                | Blog.content.ilike(pattern)
                | func.coalesce(Blog.excerpt, "").ilike(pattern)
            )
            .where(Blog.published_at.isnot(None))
        )

        gallery_q = (
            select(
                literal("gallery").label("source_type"),
                Gallery.id.label("id"),
                func.coalesce(Gallery.title, "Untitled").label("title"),
                Gallery.id.cast(String).label("slug"),
                Gallery.cloudinary_url.label("thumbnail_url"),
                func.coalesce(Gallery.category, "").label("excerpt"),
                Gallery.created_at.label("created_at"),
            )
            .where(
                func.coalesce(Gallery.title, "").ilike(pattern)
                | func.coalesce(Gallery.category, "").ilike(pattern)
            )
        )

        union = union_all(video_q, blog_q, gallery_q).alias("search_results")
        count_q = select(func.count()).select_from(union)
        total = (await self.db.execute(count_q)).scalar() or 0

        per_page = max(1, min(50, per_page))
        page = max(1, page)
        total_pages = ceil(total / per_page) if total > 0 else 0
        offset = (page - 1) * per_page

        data_q = (
            select(union)
            .order_by(union.c.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        result = await self.db.execute(data_q)
        rows = result.all()

        items = [
            SearchResultItem(
                id=str(row.id),
                title=row.title,
                slug=str(row.slug),
                source_type=row.source_type,
                thumbnail_url=row.thumbnail_url,
                excerpt=row.excerpt[:200] + "..." if row.excerpt and len(row.excerpt) > 200 else row.excerpt,
                created_at=row.created_at,
            )
            for row in rows
        ]

        return SearchResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        )
