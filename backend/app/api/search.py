from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.search_service import SearchService
from app.schemas.search import SearchResponse
from app.utils.rate_limiter import rate_limiter

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
# async def global_search(
#     q: str = Query(..., min_length=1, max_length=200),
#     page: int = Query(1, ge=1),
#     per_page: int = Query(12, ge=1, le=50),
#     request: Request = Depends(),
#     db: AsyncSession = Depends(get_db),
async def global_search(
    request: Request,
    q: str = Query(..., min_length=1, max_length=200),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):

    await rate_limiter.check(request, max_requests=30, window_seconds=60, key_prefix="search")
    service = SearchService(db)
    return await service.search(q=q, page=page, per_page=per_page)
