import type { Metadata } from "next";
import { TafsirClient } from "@/components/tafsir/TafsirClient";
import { fetchTafsirForVerse } from "@/lib/api/tafsir";

export const metadata: Metadata = {
  title: "موسوعة التفسير والتدبر | Tafsir & Reflection Encyclopedia",
  description:
    "استكشف تفسير آيات القرآن الكريم من ابن كثير والسعدي والطبري والقرطبي والبغوي والميسر، مع معاني الكلمات والإعراب وأسباب النزول الموثقة.",
};

export default async function TafsirPage({
  searchParams,
}: {
  searchParams: Promise<{ surah?: string; ayah?: string; source?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const surah = Math.min(114, Math.max(1, Number(params.surah ?? 1) || 1));
  const ayah = Math.max(1, Number(params.ayah ?? 1) || 1);
  const source = params.source || "ar-tafsir-ibn-kathir";
  const tab =
    params.tab === "words" || params.tab === "asbab" || params.tab === "themes"
      ? params.tab
      : "tafsir";

  const initialData = await fetchTafsirForVerse(surah, ayah, source);

  return <TafsirClient initialData={initialData} initialTab={tab} />;
}
