from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "LH Fitness"
    APP_ENV: str = "development"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/project_gym"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/project_gym"

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FRONTEND_URL: str = "http://localhost:5173"

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    SENTRY_DSN: str = ""

    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = ""

    ADMIN_EMAIL: str = ""

    def check_required_settings(self) -> None:
        critical = []
        if not self.JWT_SECRET_KEY:
            critical.append("JWT_SECRET_KEY is not set")
        elif self.JWT_SECRET_KEY in (
            "change-this-to-a-long-random-secret-key",
            "dev-secret-key-change-in-production",
        ):
            critical.append(
                "JWT_SECRET_KEY is still set to a known default value"
            )
        if self.APP_ENV == "production":
            if not self.CLOUDINARY_CLOUD_NAME:
                critical.append("CLOUDINARY_CLOUD_NAME is not set")
            if not self.DATABASE_URL.startswith("postgresql+asyncpg://"):
                critical.append("DATABASE_URL must use asyncpg driver")
            if "localhost" in self.DATABASE_URL:
                critical.append(
                    "DATABASE_URL points to localhost in production"
                )
            if "localhost" in self.CORS_ORIGINS:
                critical.append(
                    
                    "CORS_ORIGINS contains localhost in production"
                )
        if critical:
            import logging
            logger = logging.getLogger(self.APP_NAME)
            for msg in critical:
                logger.warning(msg)
            if self.APP_ENV == "production":
                raise SystemExit(
                    "FATAL: Missing required production configuration. "
                    + "; ".join(critical)
                )

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
