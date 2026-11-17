import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TafsirClient } from "@/components/tafsir/TafsirClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { SURAHS } from "@/data/surahs";
import { fetchTafsirForVerse } from "@/lib/api/tafsir";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surah: string; ayah: string }>;
}): Promise<Metadata> {
  const { surah, ayah } = await params;
  const surahNum = Number(surah);
  const ayahNum = Number(ayah);
  const meta = SURAHS.find((s) => s.number === surahNum);

  if (!meta) {
    return { title: "تفسير القرآن الكريم" };
  }

  return buildPageMetadata({
    title: `تفسير سورة ${meta.nameAr} الآية ${ayahNum} — Tafsir ${meta.englishName} ${surahNum}:${ayahNum}`,
    description: `تفسير الآية ${ayahNum} من سورة ${meta.nameAr} من أمهات كتب التفسير الموثقة على منصة وصل الإسلامية.`,
    path: `/tafsir/${surahNum}/${ayahNum}`,
  });
}

export default async function TafsirVerseRoute({
  params,
  searchParams,
}: {
  params: Promise<{ surah: string; ayah: string }>;
  searchParams: Promise<{ source?: string; tab?: string }>;
}) {
  const { surah, ayah } = await params;
  const sp = await searchParams;

  const surahNum = Number(surah);
  const ayahNum = Number(ayah);
  const meta = SURAHS.find((s) => s.number === surahNum);

  if (!meta || !Number.isInteger(ayahNum) || ayahNum < 1 || ayahNum > meta.numberOfAyahs) {
    notFound();
  }

  const initialData = await fetchTafsirForVerse(
    surahNum,
    ayahNum,
    sp.source || "ar-tafsir-ibn-kathir"
  );
  const tab =
    sp.tab === "words" || sp.tab === "asbab" || sp.tab === "themes"
      ? sp.tab
      : "tafsir";

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "التفسير والتدبر", path: "/tafsir" },
          {
            name: `${meta.nameAr} (${surahNum}:${ayahNum})`,
            path: `/tafsir/${surahNum}/${ayahNum}`,
          },
        ])}
      />
      <TafsirClient initialData={initialData} initialTab={tab} />
    </>
  );
}
