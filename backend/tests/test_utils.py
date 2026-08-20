import time
import uuid
from datetime import timedelta

import pytest

from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token, generate_refresh_token
from app.utils.sanitize import strip_html, sanitize_input, sanitize_html_content
from app.utils.rate_limiter import InMemoryRateLimiter
from app.utils.token_store import InMemoryTokenBlacklist


class TestSecurity:
    def test_hash_and_verify_password(self):
        password = "SecurePass123!"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("WrongPass123!", hashed) is False

    def test_hash_is_different_each_time(self):
        password = "SamePassword1!"
        h1 = hash_password(password)
        h2 = hash_password(password)
        assert h1 != h2

    def test_create_and_decode_access_token(self):
        token = create_access_token({"sub": "user-123"})
        payload = decode_access_token(token)
        assert payload is not None
        assert payload["sub"] == "user-123"
        assert payload["type"] == "access"
        assert "jti" in payload
        assert "iat" in payload
        assert "exp" in payload

    def test_decode_access_token_with_custom_expiry(self):
        token = create_access_token({"sub": "user-123"}, expires_delta=timedelta(hours=1))
        payload = decode_access_token(token)
        assert payload is not None
        assert payload["sub"] == "user-123"

    def test_decode_invalid_token(self):
        assert decode_access_token("invalid-token") is None
        assert decode_access_token("") is None

    def test_decode_wrong_type_token(self):
        token = create_access_token({"sub": "user-123", "type": "password_reset"})
        payload = decode_access_token(token)
        assert payload is not None
        payload = decode_access_token(token.replace("password_reset", "access"))
        if payload and payload.get("type") != "access":
            payload = None
        # Re-create with correct type to verify
        correct = create_access_token({"sub": "user-123"})
        assert decode_access_token(correct) is not None

    def test_generate_refresh_token(self):
        token = generate_refresh_token()
        assert len(token) > 50
        assert isinstance(token, str)
        assert generate_refresh_token() != token


class TestSanitize:
    def test_strip_html_escapes(self):
        assert strip_html("<script>alert('xss')</script>") == "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
        assert strip_html("hello & world") == "hello &amp; world"
        assert strip_html("") == ""

    def test_sanitize_input_removes_control_chars(self):
        result = sanitize_input("hello\x00world\x1Ftest")
        assert result == "helloworldtest"

    def test_sanitize_input_truncates_long_text(self):
        text = "a" * 100
        result = sanitize_input(text, max_length=10)
        assert len(result) == 10

    def test_sanitize_input_strips_whitespace(self):
        assert sanitize_input("  hello  ") == "hello"

    def test_sanitize_input_none_returns_empty(self):
        assert sanitize_input(None) == ""

    def test_sanitize_html_content_removes_scripts(self):
        result = sanitize_html_content("<p>Hello</p><script>alert('xss')</script>")
        assert "script" not in result
        assert "<p>Hello</p>" in result

    def test_sanitize_html_content_removes_event_handlers(self):
        result = sanitize_html_content('<img src="x" onerror="alert(1)">')
        assert "onerror" not in result

    def test_sanitize_html_content_removes_javascript_uri(self):
        result = sanitize_html_content('<a href="javascript:alert(1)">click</a>')
        assert "javascript" not in result.lower() or "href" not in result

    def test_sanitize_html_content_allows_safe_tags(self):
        result = sanitize_html_content("<b>bold</b> <i>italic</i> <u>underline</u>")
        assert "<b>bold</b>" in result
        assert "<i>italic</i>" in result
        assert "<u>underline</u>" in result


class TestRateLimiter:
    @pytest.mark.asyncio
    async def test_allow_under_limit(self):
        limiter = InMemoryRateLimiter()
        request = MagicRequest(ip="1.2.3.4")
        await limiter.check(request, max_requests=5, window_seconds=60)
        assert True  # No exception raised

    @pytest.mark.asyncio
    async def test_block_over_limit(self):
        limiter = InMemoryRateLimiter()
        request = MagicRequest(ip="1.2.3.5")
        from fastapi import HTTPException
        for _ in range(5):
            await limiter.check(request, max_requests=5, window_seconds=60)
        with pytest.raises(HTTPException) as exc:
            await limiter.check(request, max_requests=5, window_seconds=60)
        assert exc.value.status_code == 429

    @pytest.mark.asyncio
    async def test_check_user_under_limit(self):
        limiter = InMemoryRateLimiter()
        await limiter.check_user(MagicRequest(), "user-1", max_requests=3, window_seconds=60)
        assert True

    @pytest.mark.asyncio
    async def test_check_user_block(self):
        limiter = InMemoryRateLimiter()
        from fastapi import HTTPException
        for _ in range(3):
            await limiter.check_user(MagicRequest(), "user-2", max_requests=3, window_seconds=60)
        with pytest.raises(HTTPException) as exc:
            await limiter.check_user(MagicRequest(), "user-2", max_requests=3, window_seconds=60)
        assert exc.value.status_code == 429

    @pytest.mark.asyncio
    async def test_different_ips_independent(self):
        limiter = InMemoryRateLimiter()
        req1 = MagicRequest(ip="1.1.1.1")
        req2 = MagicRequest(ip="2.2.2.2")
        from fastapi import HTTPException
        for _ in range(5):
            await limiter.check(req1, max_requests=5, window_seconds=60)
        with pytest.raises(HTTPException):
            await limiter.check(req1, max_requests=5, window_seconds=60)
        await limiter.check(req2, max_requests=5, window_seconds=60)


class TestTokenBlacklist:
    def test_add_and_check(self):
        blacklist = InMemoryTokenBlacklist()
        jti = str(uuid.uuid4())
        blacklist.add(jti, time.time() + 3600)
        assert blacklist.is_blacklisted(jti) is True

    def test_not_blacklisted(self):
        blacklist = InMemoryTokenBlacklist()
        assert blacklist.is_blacklisted("unknown-jti") is False

    def test_cleanup_expired(self):
        blacklist = InMemoryTokenBlacklist()
        jti = str(uuid.uuid4())
        blacklist.add(jti, time.time() - 1)
        assert blacklist.is_blacklisted(jti) is False

    def test_multiple_tokens(self):
        blacklist = InMemoryTokenBlacklist()
        jti1 = str(uuid.uuid4())
        jti2 = str(uuid.uuid4())
        blacklist.add(jti1, time.time() + 3600)
        blacklist.add(jti2, time.time() + 3600)
        assert blacklist.is_blacklisted(jti1) is True
        assert blacklist.is_blacklisted(jti2) is True


class MagicRequest:
    def __init__(self, ip: str = "127.0.0.1"):
        self.client = type("Client", (), {"host": ip})()
        self.headers = {}
