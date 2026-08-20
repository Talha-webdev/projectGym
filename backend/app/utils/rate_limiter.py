import time
from collections import defaultdict
from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    def __init__(self):
        self._buckets: dict[str, list[float]] = defaultdict(list)

    async def check(
        self,
        request: Request,
        max_requests: int,
        window_seconds: int = 60,
        key_prefix: str = "ip",
    ):
        client_ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or request.headers.get("X-Real-IP")
            or (request.client.host if request.client else "unknown")
        )
        key = f"{key_prefix}:{client_ip}"
        now = time.time()
        cutoff = now - window_seconds
        bucket = self._buckets[key]
        bucket[:] = [ts for ts in bucket if ts > cutoff]
        if len(bucket) >= max_requests:
            retry_after = int(bucket[0] + window_seconds - now)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in {retry_after}s.",
                headers={"Retry-After": str(max(1, retry_after))},
            )
        bucket.append(now)

    async def check_user(
        self,
        request: Request,
        user_id: str,
        max_requests: int,
        window_seconds: int = 60,
    ):
        key = f"user:{user_id}"
        now = time.time()
        cutoff = now - window_seconds
        bucket = self._buckets[key]
        bucket[:] = [ts for ts in bucket if ts > cutoff]
        if len(bucket) >= max_requests:
            retry_after = int(bucket[0] + window_seconds - now)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in {retry_after}s.",
                headers={"Retry-After": str(max(1, retry_after))},
            )
        bucket.append(now)


rate_limiter = InMemoryRateLimiter()
