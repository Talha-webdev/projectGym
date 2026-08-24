from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.comment import Comment
from app.models.video import Video
from app.models.blog import Blog
from app.models.gallery import Gallery
from app.models.site_setting import SiteSetting
from app.schemas.admin import (
    DashboardResponse,
    AdminUserResponse,
    AdminCommentResponse,
)
from app.utils.pagination import PaginationParams, paginate


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard(self) -> DashboardResponse:
        users_q = select(func.count()).select_from(User)
        total_users = (await self.db.execute(users_q)).scalar() or 0

        videos_q = select(func.count()).select_from(Video)
        total_videos = (await self.db.execute(videos_q)).scalar() or 0

        blogs_q = select(func.count()).select_from(Blog)
        total_blogs = (await self.db.execute(blogs_q)).scalar() or 0

        gallery_q = select(func.count()).select_from(Gallery)
        total_gallery = (await self.db.execute(gallery_q)).scalar() or 0

        return DashboardResponse(
            total_users=total_users,
            total_videos=total_videos,
            total_blogs=total_blogs,
            total_gallery=total_gallery,
        )

    async def get_users(
        self,
        page: int = 1,
        per_page: int = 12,
        search: str | None = None,
    ) -> dict:
        query = select(User)
        if search:
            query = query.filter(
                User.full_name.ilike(f"%{search}%") |
                User.email.ilike(f"%{search}%")
            )

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        params = PaginationParams(page, per_page)
        query = query.order_by(User.created_at.desc()).offset(params.offset).limit(params.limit)
        result = await self.db.execute(query)
        users = result.unique().scalars().all()

        items = [self._user_to_response(u) for u in users]
        return paginate(items, total, params).model_dump()

    async def get_user_detail(self, user_id: str) -> AdminUserResponse | None:
        uuid_id = UUID(user_id)
        result = await self.db.execute(
            select(User).where(User.id == uuid_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return None
        return self._user_to_response(user)

    async def get_comments(
        self,
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        query = (
            select(Comment)
            .options(selectinload(Comment.user), selectinload(Comment.video), selectinload(Comment.blog))
        )

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        params = PaginationParams(page, per_page)
        query = query.order_by(Comment.created_at.desc()).offset(params.offset).limit(params.limit)
        result = await self.db.execute(query)
        comments = result.unique().scalars().all()

        items = []
        for c in comments:
            source_type = None
            source_title = None
            if c.video_id and c.video:
                source_type = "video"
                source_title = c.video.title
            elif c.blog_id and c.blog:
                source_type = "blog"
                source_title = c.blog.title

            items.append(
                AdminCommentResponse(
                    id=str(c.id),
                    user_email=c.user.email,
                    user_name=c.user.full_name,
                    content=c.content,
                    source_type=source_type,
                    source_title=source_title,
                    created_at=c.created_at,
                )
            )

        return paginate(items, total, params).model_dump()

    async def delete_comment(self, comment_id: str) -> bool:
        uuid_id = UUID(comment_id)
        comment = await self.db.get(Comment, uuid_id)
        if not comment:
            return False
        await self.db.delete(comment)
        await self.db.commit()
        return True

    async def get_settings(self) -> dict:
        result = await self.db.execute(select(SiteSetting).order_by(SiteSetting.key))
        settings = result.scalars().all()
        return {s.key: s.value for s in settings}

    async def update_settings(self, settings: dict) -> dict:
        for key, value in settings.items():
            result = await self.db.execute(
                select(SiteSetting).where(SiteSetting.key == key)
            )
            setting = result.scalar_one_or_none()
            if setting:
                setting.value = str(value)
            else:
                setting = SiteSetting(key=key, value=str(value))
                self.db.add(setting)
        await self.db.commit()
        return await self.get_settings()

    def _user_to_response(self, user: User) -> AdminUserResponse:
        return AdminUserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            is_admin=user.is_admin,
            is_verified=user.is_verified,
            created_at=user.created_at,
        )
