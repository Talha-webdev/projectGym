import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.schemas.gallery import GalleryCreateRequest, GalleryResponse
from app.schemas.video import VideoCreateRequest, VideoResponse
from app.services.cloudinary_service import upload_image, upload_video
from app.services.gallery_service import GalleryService
from app.services.video_service import VideoService

router = APIRouter(prefix="/uploads", tags=["uploads"])

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024  # 200 MB

IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}
VIDEO_CONTENT_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/mpeg",
}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".mkv", ".avi", ".mpeg", ".mpg"}


class BlogCoverUploadResponse(BaseModel):
    cover_image_url: str
    public_id: str


class ThumbnailUploadResponse(BaseModel):
    thumbnail_url: str
    public_id: str


def _extension(filename: str | None) -> str:
    return os.path.splitext(filename or "")[1].lower()


def _reject(detail: str, code: int = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE) -> None:
    raise HTTPException(status_code=code, detail=detail)


def _validate_image(file: UploadFile) -> None:
    content_type = (file.content_type or "").lower()
    if content_type not in IMAGE_CONTENT_TYPES:
        _reject("Invalid image type. Allowed: JPEG, PNG, GIF, WebP, AVIF.")
    ext = _extension(file.filename)
    if ext and ext not in IMAGE_EXTENSIONS:
        _reject("Invalid image extension. Allowed: .jpg, .jpeg, .png, .gif, .webp, .avif.")


def _validate_video(file: UploadFile) -> None:
    content_type = (file.content_type or "").lower()
    if content_type not in VIDEO_CONTENT_TYPES:
        _reject("Invalid video type. Allowed: MP4, WebM, MOV, AVI, MPEG.")
    ext = _extension(file.filename)
    if ext and ext not in VIDEO_EXTENSIONS:
        _reject("Invalid video extension. Allowed: .mp4, .webm, .mov, .mkv, .avi, .mpeg, .mpg.")


def _split_ids(raw: str | None) -> list[str] | None:
    if not raw:
        return None
    ids = [part.strip() for part in raw.split(",") if part.strip()]
    return ids or None


def _upload_error(exc: Exception) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="File upload failed. Please try again later.",
    )


@router.post("/video", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def upload_video_endpoint(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str | None = Form(None),
    thumbnail: UploadFile | None = File(None),
    duration: int | None = Form(None),
    is_premium: bool = Form(False),
    category_ids: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    _validate_video(file)
    data = await file.read()
    if len(data) > MAX_VIDEO_SIZE_BYTES:
        _reject(
            "Video is too large. Maximum size is 200 MB.",
            status.HTTP_413_CONTENT_TOO_LARGE,
        )

    thumbnail_url = None
    if thumbnail is not None:
        _validate_image(thumbnail)
        thumb_data = await thumbnail.read()
        if len(thumb_data) > MAX_IMAGE_SIZE_BYTES:
            _reject(
                "Thumbnail is too large. Maximum size is 10 MB.",
                status.HTTP_413_CONTENT_TOO_LARGE,
            )
        try:
            thumb = await upload_image(thumb_data, folder="video_thumbnails")
        except RuntimeError as exc:
            raise _upload_error(exc)
        thumbnail_url = thumb["secure_url"]

    try:
        uploaded = await upload_video(data, folder="videos")
    except RuntimeError as exc:
        if thumbnail_url:
            await _cleanup(None, "image", thumbnail_url)
        raise _upload_error(exc)

    try:
        request = VideoCreateRequest(
            title=title,
            description=description,
            cloudinary_public_id=uploaded["public_id"],
            cloudinary_url=uploaded["secure_url"],
            thumbnail_url=thumbnail_url,
            duration=duration if duration is not None else uploaded.get("duration"),
            is_premium=is_premium,
            category_ids=_split_ids(category_ids),
        )
    except ValidationError as exc:
        await _cleanup(uploaded["public_id"], "video", thumbnail_url)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        )

    try:
        return await VideoService(db).create(request)
    except Exception:
        await _cleanup(uploaded["public_id"], "video", thumbnail_url)
        raise


@router.post("/gallery", response_model=GalleryResponse, status_code=status.HTTP_201_CREATED)
async def upload_gallery_endpoint(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    category: str | None = Form(None),
    sort_order: int = Form(0),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    _validate_image(file)
    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE_BYTES:
        _reject(
            "Image is too large. Maximum size is 10 MB.",
            status.HTTP_413_CONTENT_TOO_LARGE,
        )

    try:
        uploaded = await upload_image(data, folder="gallery")
    except RuntimeError as exc:
        raise _upload_error(exc)

    try:
        request = GalleryCreateRequest(
            title=title,
            cloudinary_public_id=uploaded["public_id"],
            cloudinary_url=uploaded["secure_url"],
            category=category,
            sort_order=sort_order,
        )
    except ValidationError as exc:
        await _cleanup(uploaded["public_id"], "image")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        )

    try:
        return await GalleryService(db).create(request)
    except Exception:
        await _cleanup(uploaded["public_id"], "image")
        raise


@router.post("/blog-cover", response_model=BlogCoverUploadResponse)
async def upload_blog_cover_endpoint(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin),
):
    _validate_image(file)
    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE_BYTES:
        _reject(
            "Image is too large. Maximum size is 10 MB.",
            status.HTTP_413_CONTENT_TOO_LARGE,
        )
    try:
        uploaded = await upload_image(data, folder="blog_covers")
    except RuntimeError as exc:
        raise _upload_error(exc)
    return BlogCoverUploadResponse(
        cover_image_url=uploaded["secure_url"],
        public_id=uploaded["public_id"],
    )


@router.post("/thumbnail", response_model=ThumbnailUploadResponse)
async def upload_thumbnail_endpoint(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin),
):
    _validate_image(file)
    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE_BYTES:
        _reject(
            "Image is too large. Maximum size is 10 MB.",
            status.HTTP_413_CONTENT_TOO_LARGE,
        )
    try:
        uploaded = await upload_image(data, folder="video_thumbnails")
    except RuntimeError as exc:
        raise _upload_error(exc)
    return ThumbnailUploadResponse(
        thumbnail_url=uploaded["secure_url"],
        public_id=uploaded["public_id"],
    )


async def _cleanup(public_id: str, resource_type: str, thumbnail_url: str | None = None) -> None:
    from app.services.cloudinary_service import destroy_asset, parse_public_id

    try:
        await destroy_asset(public_id, resource_type=resource_type)
    except Exception:
        pass
    if thumbnail_url:
        thumb_pid = parse_public_id(thumbnail_url)
        if thumb_pid:
            try:
                await destroy_asset(thumb_pid, resource_type="image")
            except Exception:
                pass
