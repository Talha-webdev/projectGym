from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.services.admin_service import AdminService
from app.schemas.admin import DashboardResponse, AdminUserResponse, MembershipActionRequest

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


@router.patch("/users/{user_id}/membership", response_model=AdminUserResponse)
async def admin_manage_membership(
    user_id: str,
    request: MembershipActionRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    try:
        return await service.manage_membership(user_id, request.action, request.days)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/payments")
async def admin_payments(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = AdminService(db)
    return await service.get_payments(page=page, per_page=per_page)


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
