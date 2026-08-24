from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.comment import (
    CommentResponse,
    CommentCreateRequest,
    CommentUpdateRequest,
)
from app.services.comment_service import CommentService
from app.utils.rate_limiter import rate_limiter
from app.utils.sanitize import strip_html

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/video/{video_id}")
async def get_video_comments(
    video_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    service = CommentService(db)
    return await service.get_by_video(video_id, page=page, per_page=per_page)


@router.get("/blog/{blog_id}")
async def get_blog_comments(
    blog_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    service = CommentService(db)
    return await service.get_by_blog(blog_id, page=page, per_page=per_page)


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    request: CommentCreateRequest,
    request_http: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await rate_limiter.check(request_http, max_requests=10, window_seconds=60)
    if not request.video_id and not request.blog_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either video_id or blog_id must be provided.",
        )
    if request.video_id and request.blog_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only one of video_id or blog_id may be provided.",
        )
    sanitized_content = strip_html(request.content)
    try:
        service = CommentService(db)
        return await service.create(
            content=sanitized_content,
            user_id=str(current_user.id),
            video_id=request.video_id,
            blog_id=request.blog_id,
            parent_id=request.parent_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    request: CommentUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sanitized_content = strip_html(request.content)
    try:
        service = CommentService(db)
        comment = await service.update(
            comment_id=comment_id,
            user_id=str(current_user.id),
            content=sanitized_content,
            is_admin=current_user.is_admin,
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found.",
        )
    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = CommentService(db)
        deleted = await service.delete(
            comment_id=comment_id,
            user_id=str(current_user.id),
            is_admin=current_user.is_admin,
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found.",
        )
