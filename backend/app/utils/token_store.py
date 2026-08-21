import time
from collections import defaultdict
from typing import Set


class InMemoryTokenBlacklist:
    """
    In-memory token blacklist for revoked JWTs.

    LIMITATIONS (important for production):
    - State is lost on server restart — previously revoked tokens become
      valid again until they naturally expire.
    - Not shared across multiple workers or processes. A token revoked in
      one worker remains valid in others.
    - Memory grows with revoked tokens; expired entries are cleaned up
      lazily on access.

    For multi-worker or stateless deployments, replace this with a
    Redis-backed or database-backed blacklist.
    """

    def __init__(self):
        self._blacklist: dict[str, float] = {}

    def add(self, jti: str, expires_at: float) -> None:
        self._cleanup()
        self._blacklist[jti] = expires_at

    def is_blacklisted(self, jti: str) -> bool:
        self._cleanup()
        return jti in self._blacklist

    def _cleanup(self) -> None:
        now = time.time()
        expired = [jti for jti, exp in self._blacklist.items() if exp <= now]
        for jti in expired:
            del self._blacklist[jti]


token_blacklist = InMemoryTokenBlacklist()
