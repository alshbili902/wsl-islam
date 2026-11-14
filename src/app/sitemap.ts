import type { MetadataRoute } from "next";
import { ARTICLES } from "@/data/articles";
import { SURAHS } from "@/data/surahs";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/quran",
    "/mushaf",
    "/tafsir",
    "/khatmah",
    "/listen",
    "/listen/reciters",
    "/listen/library",
    "/prayer-times",
    "/adhkar",
    "/hadith",
    "/radio",
    "/lectures",
    "/knowledge",
    "/notifications",
    "/reading-settings",
    "/ramadan",
    "/zakat",
    "/quiz",
    "/calendar",
    "/resources",
    "/bookmarks",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.85,
  }));

  const surahRoutes = SURAHS.map((s) => ({
    url: `${baseUrl}/quran/${s.number}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articleRoutes = ARTICLES.map((a) => ({
    url: `${baseUrl}/knowledge/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...surahRoutes, ...articleRoutes];
}
