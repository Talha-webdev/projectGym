import asyncio
import logging
from typing import Any

import cloudinary
import cloudinary.uploader

from app.config import settings

logger = logging.getLogger(__name__)

IMAGE_RESOURCE_TYPE = "image"
VIDEO_RESOURCE_TYPE = "video"


def is_configured() -> bool:
    return bool(
        settings.CLOUDINARY_CLOUD_NAME
        and settings.CLOUDINARY_API_KEY
        and settings.CLOUDINARY_API_SECRET
    )


def configure() -> None:
    if not is_configured():
        return
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def _require_config() -> None:
    if not is_configured():
        raise RuntimeError(
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the environment."
        )


async def upload_image(data: bytes, folder: str) -> dict[str, Any]:
    return await _upload(data, folder=folder, resource_type=IMAGE_RESOURCE_TYPE)


async def upload_video(data: bytes, folder: str) -> dict[str, Any]:
    return await _upload(data, folder=folder, resource_type=VIDEO_RESOURCE_TYPE)


async def _upload(data: bytes, folder: str, resource_type: str) -> dict[str, Any]:
    configure()
    _require_config()
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            data,
            folder=folder,
            resource_type=resource_type,
            use_filename=True,
            unique_filename=True,
            overwrite=False,
        )
    except Exception as exc:
        logger.exception("Cloudinary upload failed: %s", exc)
        raise RuntimeError(f"Cloudinary upload failed: {exc}") from exc

    info: dict[str, Any] = {
        "public_id": result.get("public_id"),
        "secure_url": result.get("secure_url"),
        "resource_type": resource_type,
        "format": result.get("format"),
    }
    if resource_type == VIDEO_RESOURCE_TYPE and result.get("duration"):
        info["duration"] = result.get("duration")
    return info


async def destroy_asset(
    public_id: str, resource_type: str = IMAGE_RESOURCE_TYPE
) -> bool:
    if not public_id:
        return False
    configure()
    if not is_configured():
        return False
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.destroy,
            public_id,
            resource_type=resource_type,
        )
        return result.get("result") == "ok"
    except Exception:
        logger.exception("Cloudinary destroy failed for %s", public_id)
        return False


def parse_public_id(url: str | None) -> str | None:
    if not url:
        return None
    if "res.cloudinary.com/" not in url:
        return None
    url = url.split("?", 1)[0].split("#", 1)[0]
    try:
        path = url.split("res.cloudinary.com/", 1)[1]
        parts = [p for p in path.split("/") if p]
        if len(parts) < 4:
            return None
        parts = parts[3:]
        if parts and parts[0].startswith("v") and parts[0][1:].isdigit():
            parts = parts[1:]
        if not parts:
            return None
        public_id = "/".join(parts)
        public_id = public_id.rsplit(".", 1)[0]
        return public_id or None
    except Exception:
        logger.exception("Failed to parse Cloudinary public id from URL: %s", url)
        return None