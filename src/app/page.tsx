import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";
import { getDailyVerse } from "@/data/daily-verses";
import { DAILY_HADITHS } from "@/data/hadith-books";
import { getArticles, getRadioStations } from "@/lib/data/repository";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "الرئيسية",
  absoluteTitle: "وصل الإسلامية | Wasl Islamic — القرآن والسنة والأذكار ومواقيت الصلاة",
  description:
    "منصة وصل الإسلامية: تجربة رقمية إسلامية موثوقة للقرآن الكريم تلاوةً وتفسيراً، ومواقيت الصلاة الدقيقة، والأذكار، ومكتبة الحديث الشريف، والإذاعات الإسلامية، والزكاة، والصدقة والتبرع.",
  path: "/",
});

export default async function HomePage() {
  const now = new Date();
  const dailyVerse = getDailyVerse(now);
  const dayIndex = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000
  );
  const dailyHadith = DAILY_HADITHS[Math.abs(dayIndex) % DAILY_HADITHS.length];

  const [{ stations }, { articles }] = await Promise.all([
    getRadioStations(),
    getArticles(),
  ]);

  const featuredRadios = stations.filter((s) => s.isFeatured);
  const featuredArticles = articles.filter((a) => a.isFeatured);

  return (
    <HomeExperience
      dailyVerse={dailyVerse}
      dailyHadith={dailyHadith}
      featuredRadios={featuredRadios.length > 0 ? featuredRadios : stations.slice(0, 6)}
      featuredArticles={featuredArticles.length > 0 ? featuredArticles : articles.slice(0, 3)}
    />
  );
}
