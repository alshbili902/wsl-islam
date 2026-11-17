import type { Metadata } from "next";

export const CANONICAL_SITE_URL = "https://waslislam.fun";

export const DEFAULT_SITE_NAME = "وصل الإسلامية — Wasl Islamic";
export const DEFAULT_TWITTER_HANDLE = "@waslofficiall";
export const DEFAULT_OG_IMAGE_PATH = "/branding/favicon/icon-512.png";

/**
 * Returns the canonical HTTPS origin with any trailing slashes removed.
 * Ensures development/localhost/preview URLs never leak into sitemaps,
 * robots.txt, canonical link tags, or structured data.
 */
export function getCanonicalSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "")
    .trim()
    .replace(/\/+$/, "");

  if (
    raw &&
    raw.startsWith("https://") &&
    !/localhost|127\.0\.0\.1|0\.0\.0\.0|\.workers\.dev$/i.test(raw)
  ) {
    return raw;
  }

  return CANONICAL_SITE_URL;
}

export function normalizeCanonicalPath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.replace(/\/+$/, "") || "/";
}

export function canonicalUrl(path = "/"): string {
  const base = getCanonicalSiteUrl();
  const normalized = normalizeCanonicalPath(path);
  return normalized === "/" ? `${base}/` : `${base}${normalized}`;
}

export interface BuildPageMetadataInput {
  title: string;
  absoluteTitle?: string;
  description: string;
  path: string;
  noIndex?: boolean;
  ogType?: "website" | "article";
  ogTitle?: string;
  ogDescription?: string;
  keywords?: string[];
}

export function buildPageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  noIndex = false,
  ogType = "website",
  ogTitle,
  ogDescription,
  keywords,
}: BuildPageMetadataInput): Metadata {
  const siteUrl = getCanonicalSiteUrl();
  const url = canonicalUrl(path);
  const ogImageUrl = `${siteUrl}${DEFAULT_OG_IMAGE_PATH}`;
  const cleanTitle = absoluteTitle ?? title;
  const resolvedOgTitle = ogTitle ?? `${cleanTitle}${absoluteTitle ? "" : " | وصل الإسلامية"}`;
  const resolvedOgDesc = ogDescription ?? description;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: ogType,
      locale: "ar_SA",
      alternateLocale: ["en_US"],
      siteName: DEFAULT_SITE_NAME,
      title: resolvedOgTitle,
      description: resolvedOgDesc,
      url,
      images: [
        {
          url: ogImageUrl,
          width: 512,
          height: 512,
          alt: DEFAULT_SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: resolvedOgTitle,
      description: resolvedOgDesc,
      images: [ogImageUrl],
      creator: DEFAULT_TWITTER_HANDLE,
    },
  };
}

export interface BreadcrumbSchemaItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
