import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    video_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("videos.id"), nullable=True)
    blog_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("blogs.id"), nullable=True)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("comments.id", ondelete="SET NULL"), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="comments")
    video = relationship("Video", back_populates="comments")
    blog = relationship("Blog", back_populates="comments")
    replies = relationship("Comment", back_populates="parent", remote_side=[id], cascade="all, delete-orphan", single_parent=True)
    parent = relationship("Comment", back_populates="replies", remote_side=[parent_id])

    __table_args__ = (
        CheckConstraint(
            "(video_id IS NOT NULL AND blog_id IS NULL) OR (video_id IS NULL AND blog_id IS NOT NULL)",
            name="chk_single_target",
        ),
        Index("ix_comments_video_created", "video_id", "created_at"),
        Index("ix_comments_blog_created", "blog_id", "created_at"),
        Index("ix_comments_parent_id", "parent_id"),
    )
