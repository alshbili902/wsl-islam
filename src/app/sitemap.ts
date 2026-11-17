import type { MetadataRoute } from "next";
import { ARTICLES } from "@/data/articles";
import { SURAHS } from "@/data/surahs";
import { fetchVerifiedLectures } from "@/lib/api/lectures";
import { syncAndLoadReciterCatalog } from "@/lib/audio/catalog";
import { fetchPublishedReleases } from "@/lib/releases/store";
import { canonicalUrl } from "@/lib/seo/config";

export const revalidate = 3600;

// Genuine verified repository modification timestamps per route section (never fabricated via Date.now())
const STATIC_ROUTE_LASTMOD: Record<string, string> = {
  "/": "2026-11-17T22:15:00+03:00",
  "/quran": "2026-11-16T21:24:37+03:00",
  "/mushaf": "2026-11-16T22:48:05+03:00",
  "/tafsir": "2026-11-14T03:31:14+03:00",
  "/khatmah": "2026-11-14T03:31:14+03:00",
  "/listen": "2026-11-14T03:31:14+03:00",
  "/listen/reciters": "2026-11-14T03:31:14+03:00",
  "/prayer-times": "2026-11-14T03:31:14+03:00",
  "/adhkar": "2026-11-14T03:31:14+03:00",
  "/hadith": "2026-11-14T03:31:14+03:00",
  "/radio": "2026-11-14T03:31:14+03:00",
  "/lectures": "2026-11-14T03:31:14+03:00",
  "/knowledge": "2026-11-14T03:31:14+03:00",
  "/ramadan": "2026-11-14T03:31:14+03:00",
  "/zakat": "2026-11-14T03:31:14+03:00",
  "/charity": "2026-11-17T21:53:14+03:00",
  "/quiz": "2026-11-14T03:31:14+03:00",
  "/calendar": "2026-11-14T03:31:14+03:00",
  "/resources": "2026-11-14T03:31:14+03:00",
};

const ARTICLES_LASTMOD = new Date("2026-11-14T03:31:14+03:00");
const SURAHS_LASTMOD = new Date("2026-11-16T21:24:37+03:00");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  const addEntry = (path: string, lastModified?: Date) => {
    const url = canonicalUrl(path);
    if (seen.has(url)) return;
    seen.add(url);
    entries.push(lastModified ? { url, lastModified } : { url });
  };

  // 1. Public indexable core & service pages (explicitly excludes noindex utility routes)
  for (const [route, isoDate] of Object.entries(STATIC_ROUTE_LASTMOD)) {
    addEntry(route, new Date(isoDate));
  }

  // /updates uses the latest verified published release timestamp if present
  try {
    const published = await fetchPublishedReleases(1);
    const latestUpdateDate =
      published[0]?.publishedAt && !Number.isNaN(Date.parse(published[0].publishedAt))
        ? new Date(published[0].publishedAt)
        : new Date("2026-11-17T22:15:00+03:00");
    addEntry("/updates", latestUpdateDate);
  } catch {
    addEntry("/updates", new Date("2026-11-17T22:15:00+03:00"));
  }

  // 2. All 114 Holy Quran Surah pages
  for (const surah of SURAHS) {
    addEntry(`/quran/${surah.number}`, SURAHS_LASTMOD);
  }

  // 3. Curated Islamic knowledge articles
  for (const article of ARTICLES) {
    addEntry(`/knowledge/${article.slug}`, ARTICLES_LASTMOD);
  }

  // 4. Verified Islamic lectures & reciter catalog profiles
  const [lecturesResult, reciterCatalogResult] = await Promise.allSettled([
    fetchVerifiedLectures({ lang: "all" }),
    syncAndLoadReciterCatalog(),
  ]);

  if (lecturesResult.status === "fulfilled" && Array.isArray(lecturesResult.value)) {
    for (const lecture of lecturesResult.value) {
      if (lecture?.slug) {
        addEntry(`/lectures/${lecture.slug}`);
      }
    }
  }

  if (
    reciterCatalogResult.status === "fulfilled" &&
    Array.isArray(reciterCatalogResult.value?.reciters)
  ) {
    for (const reciter of reciterCatalogResult.value.reciters) {
      if (reciter?.slug) {
        addEntry(`/listen/reciters/${reciter.slug}`);
      }
    }
  }

  // Google protocol limit guard: cap strictly within 50,000 entries
  return entries.slice(0, 50000);
}
