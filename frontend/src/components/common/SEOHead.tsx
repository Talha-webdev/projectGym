import { useEffect, useId } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  canonical?: string;
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = "LH Fitness";
const DEFAULT_DESCRIPTION = "Transform your body and life with Coach's proven 3-month fitness system.";
const DEFAULT_OG_IMAGE = "https://projectgym.com/og-default.jpg";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl,
  ogType = "website",
  canonical,
  robots,
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const scriptId = useId();

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el: Element | null = document.querySelector(
        `meta[${attr}="${name}"]`
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string) => {
      let el: Element | null = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:type", ogType, true);
    setMeta("og:locale", "en_US", true);
    if (ogImage) setMeta("og:image", ogImage, true);
    if (ogUrl) setMeta("og:url", ogUrl, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    if (ogImage) setMeta("twitter:image", ogImage);

    if (canonical) {
      setLink("canonical", canonical);
    }

    if (robots) {
      setMeta("robots", robots);
    }

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    if (jsonLd) {
      const scripts = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      scripts.forEach((data, i) => {
        const script = document.createElement("script");
        script.id = i === 0 ? scriptId : `${scriptId}-${i}`;
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }

    return () => {
      if (canonical) {
        const el = document.querySelector(`link[rel="canonical"]`);
        if (el) el.remove();
      }
      if (jsonLd) {
        const scripts = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
        scripts.forEach((_, i) => {
          const id = i === 0 ? scriptId : `${scriptId}-${i}`;
          const el = document.getElementById(id);
          if (el) el.remove();
        });
      }
    };
  }, [fullTitle, description, ogImage, ogUrl, ogType, canonical, robots, jsonLd, scriptId]);

  return null;
}
