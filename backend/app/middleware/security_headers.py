from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), "
            "interest-cohort=(), payment=()"
        )
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        csp = (
            f"default-src 'self'; "
            f"script-src 'self' https://js.stripe.com https://*.cloudinary.com; "
            f"style-src 'self' 'unsafe-inline'; "
            f"img-src 'self' data: blob: https:; "
            f"frame-src https://js.stripe.com; "
            f"connect-src 'self' https://api.stripe.com https://*.cloudinary.com; "
            f"font-src 'self'; "
            f"base-uri 'self'; "
            f"form-action 'self' https://stripe.com; "
        )
        response.headers["Content-Security-Policy"] = csp
        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        return response
