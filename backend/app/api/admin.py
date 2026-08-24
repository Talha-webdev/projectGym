from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.models.site_setting import SiteSetting
from app.services.admin_service import AdminService
from app.services.blog_service import BlogService
from app.services import cloudinary_service
from app.schemas.admin import DashboardResponse, AdminUserResponse
from app.schemas.website_settings import WebsiteSettingsResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardResponse)
async def admin_dashboard(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    return await service.get_dashboard()


@router.get("/users")
async def admin_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    return await service.get_users(page=page, per_page=per_page, search=search)


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def admin_user_detail(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    user = await service.get_user_detail(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/comments")
async def admin_comments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    return await service.get_comments(page=page, per_page=per_page)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_comment(
    comment_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    deleted = await service.delete_comment(comment_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")


@router.get("/blogs")
async def admin_list_blogs(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = BlogService(db)
    return await service.get_list(
        page=page,
        per_page=per_page,
        search=search,
        include_drafts=True,
    )


@router.get("/settings")
async def admin_get_settings(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    return await service.get_settings()


@router.patch("/settings")
async def admin_update_settings(
    settings: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    return await service.update_settings(settings)


# Website Settings endpoints

IMAGE_KEYS = [
    "hero_image_url",
    "coach_image_url",
    "before_image_url",
    "after_image_url",
    "about_story_image_url",
    "about_before_image_url",
    "about_after_image_url",
]

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


async def _get_all_settings(db: AsyncSession) -> dict[str, str]:
    from sqlalchemy import select
    result = await db.execute(select(SiteSetting).order_by(SiteSetting.key))
    return {s.key: s.value for s in result.scalars().all()}


@router.get("/website-settings", response_model=WebsiteSettingsResponse)
async def admin_get_website_settings(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    settings = await _get_all_settings(db)
    return WebsiteSettingsResponse(settings=settings)


@router.patch("/website-settings", response_model=WebsiteSettingsResponse)
async def admin_update_website_settings(
    settings: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from sqlalchemy import select
    for key, value in settings.items():
        result = await db.execute(
            select(SiteSetting).where(SiteSetting.key == key)
        )
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = str(value)
        else:
            setting = SiteSetting(key=key, value=str(value))
            db.add(setting)
    await db.commit()
    updated = await _get_all_settings(db)
    return WebsiteSettingsResponse(settings=updated)


@router.post("/website-settings/upload", response_model=WebsiteSettingsResponse)
async def admin_upload_website_image(
    key: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image type. Allowed: JPEG, PNG, WebP. Got: {file.content_type}",
        )

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is 10MB.",
        )

    from sqlalchemy import select

    if key in IMAGE_KEYS:
        old_result = await db.execute(
            select(SiteSetting).where(SiteSetting.key == key + "_public_id")
        )
        old_setting = old_result.scalar_one_or_none()
        if old_setting and old_setting.value:
            await cloudinary_service.destroy_asset(old_setting.value)

        upload_result = await cloudinary_service.upload_image(data, folder="website-settings")
        url = upload_result["secure_url"]
        public_id = upload_result["public_id"]

        url_result = await db.execute(
            select(SiteSetting).where(SiteSetting.key == key)
        )
        url_setting = url_result.scalar_one_or_none()
        if url_setting:
            url_setting.value = url
        else:
            url_setting = SiteSetting(key=key, value=url)
            db.add(url_setting)

        pid_result = await db.execute(
            select(SiteSetting).where(SiteSetting.key == key + "_public_id")
        )
        pid_setting = pid_result.scalar_one_or_none()
        if pid_setting:
            pid_setting.value = public_id
        else:
            pid_setting = SiteSetting(key=key + "_public_id", value=public_id)
            db.add(pid_setting)

        await db.commit()
    else:
        upload_result = await cloudinary_service.upload_image(data, folder="website-settings")
        url = upload_result["secure_url"]
        public_id = upload_result["public_id"]

        result = await db.execute(
            select(SiteSetting).where(SiteSetting.key == key)
        )
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = url
        else:
            setting = SiteSetting(key=key, value=url)
            db.add(setting)

        pid_result = await db.execute(
            select(SiteSetting).where(SiteSetting.key == key + "_public_id")
        )
        pid_setting = pid_result.scalar_one_or_none()
        if pid_setting:
            pid_setting.value = public_id
        else:
            pid_setting = SiteSetting(key=key + "_public_id", value=public_id)
            db.add(pid_setting)

        await db.commit()

    updated = await _get_all_settings(db)
    return WebsiteSettingsResponse(settings=updated)


@router.delete("/website-settings/{key}", response_model=WebsiteSettingsResponse)
async def admin_delete_website_setting(
    key: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from sqlalchemy import select

    result = await db.execute(
        select(SiteSetting).where(SiteSetting.key == key)
    )
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting '{key}' not found",
        )

    if key in IMAGE_KEYS:
        pid_result = await db.execute(
            select(SiteSetting).where(SiteSetting.key == key + "_public_id")
        )
        pid_setting = pid_result.scalar_one_or_none()
        if pid_setting and pid_setting.value:
            await cloudinary_service.destroy_asset(pid_setting.value)
            await db.delete(pid_setting)

    await db.delete(setting)
    await db.commit()
    updated = await _get_all_settings(db)
    return WebsiteSettingsResponse(settings=updated)
