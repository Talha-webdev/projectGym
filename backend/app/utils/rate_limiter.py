import time
from collections import defaultdict
from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    """
    In-memory rate limiter using sliding window counters.

    LIMITATIONS (important for production):
    - State is lost on server restart — all buckets reset.
    - Not shared across multiple workers or processes (e.g., gunicorn with
      multiple workers, Kubernetes pods). Each worker has its own counters,
      so the effective limit is multiplied by the number of workers.
    - Memory grows linearly with unique keys; expired entries are cleaned up
      lazily on access, not proactively.

    For multi-worker or stateless deployments, replace this with a
    Redis-backed or database-backed rate limiter.
    """

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
