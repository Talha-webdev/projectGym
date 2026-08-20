import time
from collections import defaultdict
from typing import Set


class InMemoryTokenBlacklist:
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
