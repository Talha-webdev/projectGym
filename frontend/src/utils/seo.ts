export function videoObjectSchema({
  title,
  description,
  slug,
  thumbnailUrl,
  uploadDate,
  duration,
}: {
  title: string;
  description?: string | null;
  slug: string;
  thumbnailUrl?: string | null;
  uploadDate: string;
  duration?: number | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: description || title,
    thumbnailUrl: thumbnailUrl || undefined,
    uploadDate,
    contentUrl: `https://projectgym.com/videos/${slug}`,
    embedUrl: `https://projectgym.com/videos/${slug}`,
    duration: duration ? `PT${duration}S` : undefined,
  };
}

export function articleSchema({
  title,
  description,
  slug,
  imageUrl,
  datePublished,
  authorName = "Coach",
}: {
  title: string;
  description?: string | null;
  slug: string;
  imageUrl?: string | null;
  datePublished: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || title,
    image: imageUrl || undefined,
    datePublished,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Project GYM",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://projectgym.com/blogs/${slug}`,
    },
  };
}

const SITE_URL = "https://projectgym.com";

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
