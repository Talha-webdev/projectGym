from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.comment import Comment
from app.models.video import Video
from app.models.blog import Blog
from app.models.user import User
from app.schemas.comment import CommentResponse, CommentUser
from app.utils.pagination import PaginationParams, paginate


class CommentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_video(
        self,
        video_id: str,
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        uuid_id = UUID(video_id)

        count_q = select(func.count()).select_from(
            select(Comment).where(
                Comment.video_id == uuid_id,
                Comment.parent_id.is_(None),
            ).subquery()
        )
        total = (await self.db.execute(count_q)).scalar() or 0

        params = PaginationParams(page, per_page)
        top_level_q = (
            select(Comment)
            .where(Comment.video_id == uuid_id, Comment.parent_id.is_(None))
            .options(selectinload(Comment.user))
            .order_by(Comment.created_at.desc())
            .offset(params.offset)
            .limit(params.limit)
        )
        result = await self.db.execute(top_level_q)
        top_level = result.unique().scalars().all()

        items = []
        for comment in top_level:
            replies_count = await self._count_replies(comment.id)
            items.append(self._to_response(comment, replies_count))

        return paginate(items, total, params).model_dump()

    async def get_by_blog(
        self,
        blog_id: str,
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        uuid_id = UUID(blog_id)

        count_q = select(func.count()).select_from(
            select(Comment).where(
                Comment.blog_id == uuid_id,
                Comment.parent_id.is_(None),
            ).subquery()
        )
        total = (await self.db.execute(count_q)).scalar() or 0

        params = PaginationParams(page, per_page)
        top_level_q = (
            select(Comment)
            .where(Comment.blog_id == uuid_id, Comment.parent_id.is_(None))
            .options(selectinload(Comment.user))
            .order_by(Comment.created_at.desc())
            .offset(params.offset)
            .limit(params.limit)
        )
        result = await self.db.execute(top_level_q)
        top_level = result.unique().scalars().all()

        items = []
        for comment in top_level:
            replies_count = await self._count_replies(comment.id)
            items.append(self._to_response(comment, replies_count))

        return paginate(items, total, params).model_dump()

    async def create(
        self,
        content: str,
        user_id: str,
        video_id: str | None = None,
        blog_id: str | None = None,
        parent_id: str | None = None,
    ) -> CommentResponse:
        user_uuid = UUID(user_id)
        video_uuid = UUID(video_id) if video_id else None
        blog_uuid = UUID(blog_id) if blog_id else None
        parent_uuid = UUID(parent_id) if parent_id else None

        if parent_uuid:
            parent = await self.db.get(Comment, parent_uuid)
            if parent is None:
                raise ValueError("Parent comment not found.")
            if parent.parent_id is not None:
                raise ValueError("Cannot reply to a reply. Reply to the parent comment instead.")

        comment = Comment(
            user_id=user_uuid,
            video_id=video_uuid,
            blog_id=blog_uuid,
            parent_id=parent_uuid,
            content=content,
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)

        result = await self.db.execute(
            select(Comment)
            .where(Comment.id == comment.id)
            .options(selectinload(Comment.user))
        )
        comment = result.unique().scalar_one()

        return self._to_response(comment, replies_count=0)

    async def update(
        self,
        comment_id: str,
        user_id: str,
        content: str,
        is_admin: bool = False,
    ) -> CommentResponse | None:
        uuid_id = UUID(comment_id)
        comment = await self.db.get(Comment, uuid_id)
        if comment is None:
            return None

        user_uuid = UUID(user_id)
        if comment.user_id != user_uuid and not is_admin:
            raise PermissionError("You do not have permission to edit this comment.")

        comment.content = content
        await self.db.commit()
        await self.db.refresh(comment)

        result = await self.db.execute(
            select(Comment)
            .where(Comment.id == comment.id)
            .options(selectinload(Comment.user))
        )
        comment = result.unique().scalar_one()

        replies_count = await self._count_replies(comment.id)
        return self._to_response(comment, replies_count)

    async def delete(
        self,
        comment_id: str,
        user_id: str,
        is_admin: bool = False,
    ) -> bool:
        uuid_id = UUID(comment_id)
        comment = await self.db.get(Comment, uuid_id)
        if comment is None:
            return False

        user_uuid = UUID(user_id)
        if comment.user_id != user_uuid and not is_admin:
            raise PermissionError("You do not have permission to delete this comment.")

        await self.db.delete(comment)
        await self.db.commit()
        return True

    async def _count_replies(self, comment_id: UUID) -> int:
        count_q = select(func.count()).where(Comment.parent_id == comment_id)
        result = await self.db.execute(count_q)
        return result.scalar() or 0

    def _to_response(self, comment: Comment, replies_count: int = 0) -> CommentResponse:
        return CommentResponse(
            id=str(comment.id),
            user=CommentUser(
                id=str(comment.user.id),
                full_name=comment.user.full_name,
                avatar_url=comment.user.avatar_url,
            ),
            content=comment.content,
            parent_id=str(comment.parent_id) if comment.parent_id else None,
            created_at=comment.created_at,
            replies_count=replies_count,
        )
