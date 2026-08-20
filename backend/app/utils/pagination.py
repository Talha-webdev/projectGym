from math import ceil
from typing import Generic, TypeVar, Sequence
from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams:
    def __init__(self, page: int = 1, per_page: int = 12):
        self.page = max(1, page)
        self.per_page = min(50, max(1, per_page))

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page

    @property
    def limit(self) -> int:
        return self.per_page


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[T]):
    items: Sequence[T]
    pagination: PaginationMeta


def paginate(items: Sequence[T], total: int, params: PaginationParams) -> PaginatedResponse[T]:
    total_pages = ceil(total / params.per_page) if total > 0 else 0
    return PaginatedResponse(
        items=items,
        pagination=PaginationMeta(
            page=params.page,
            per_page=params.per_page,
            total=total,
            total_pages=total_pages,
            has_next=params.page < total_pages,
            has_prev=params.page > 1,
        ),
    )
