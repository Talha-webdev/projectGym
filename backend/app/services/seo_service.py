from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.models.video import Video
from app.models.blog import Blog


class SEOService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_sitemap_urls(self) -> list[dict]:
        urls = []

        static_pages = [
            {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
            {"loc": "/about", "priority": "0.8", "changefreq": "monthly"},
            {"loc": "/journey", "priority": "0.8", "changefreq": "monthly"},
            {"loc": "/videos", "priority": "0.9", "changefreq": "weekly"},
            {"loc": "/blogs", "priority": "0.9", "changefreq": "weekly"},
            {"loc": "/gallery", "priority": "0.7", "changefreq": "monthly"},
            {"loc": "/pricing", "priority": "0.8", "changefreq": "monthly"},
            {"loc": "/contact", "priority": "0.6", "changefreq": "monthly"},
        ]
        urls.extend(static_pages)

        video_result = await self.db.execute(
            select(Video.slug, Video.updated_at).order_by(Video.created_at.desc())
        )
        for row in video_result.all():
            urls.append({
                "loc": f"/videos/{row.slug}",
                "priority": "0.7",
                "changefreq": "monthly",
                "lastmod": row.updated_at.isoformat() if row.updated_at else None,
            })

        blog_result = await self.db.execute(
            select(Blog.slug, Blog.updated_at)
            .where(Blog.published_at.isnot(None))
            .order_by(Blog.published_at.desc())
        )
        for row in blog_result.all():
            urls.append({
                "loc": f"/blogs/{row.slug}",
                "priority": "0.7",
                "changefreq": "monthly",
                "lastmod": row.updated_at.isoformat() if row.updated_at else None,
            })

        return urls


SITEMAP_TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{entries}
</urlset>"""

URL_ENTRY = """  <url>
    <loc>{loc}</loc>
    <priority>{priority}</priority>
    <changefreq>{changefreq}</changefreq>{lastmod}
  </url>"""


def build_sitemap_xml(urls: list[dict]) -> str:
    base_url = settings.FRONTEND_URL.rstrip("/")
    entries = []
    for u in urls:
        lastmod = ""
        if u.get("lastmod"):
            lastmod = f"\n    <lastmod>{u['lastmod']}</lastmod>"
        entries.append(
            URL_ENTRY.format(
                loc=f"{base_url}{u['loc']}",
                priority=u["priority"],
                changefreq=u["changefreq"],
                lastmod=lastmod,
            )
        )
    return SITEMAP_TEMPLATE.format(entries="\n".join(entries))


ROBOTS_TXT = f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /profile/
Disallow: /dashboard/
Disallow: /membership/

Sitemap: {settings.FRONTEND_URL.rstrip('/')}/sitemap.xml
"""
