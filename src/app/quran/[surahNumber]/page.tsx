import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SurahReaderClient } from "@/components/quran/SurahReaderClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { SURAHS } from "@/data/surahs";
import { fetchSurahDetail } from "@/lib/api/quran";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surahNumber: string }>;
}): Promise<Metadata> {
  const { surahNumber } = await params;
  const num = Number(surahNumber);
  const surah = SURAHS.find((s) => s.number === num);
  if (!surah) {
    return { title: "القرآن الكريم" };
  }
  return buildPageMetadata({
    title: `${surah.nameAr} (${surah.englishName}) — قراءة واستماع`,
    description: `اقرأ ${surah.nameAr} كاملة بالرسم العثماني مع التفسير الميسر والترجمة واستمع لتلاوتها بأصوات كبار القراء.`,
    path: `/quran/${surah.number}`,
  });
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ surahNumber: string }>;
}) {
  const { surahNumber } = await params;
  const num = Number(surahNumber);

  if (!Number.isInteger(num) || num < 1 || num > 114) {
    notFound();
  }

  let data: Awaited<ReturnType<typeof fetchSurahDetail>> | null = null;
  try {
    data = await fetchSurahDetail(num);
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">تعذر تحميل السورة مؤقتاً</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          واجه مزود النص القرآني المعتمد تأخراً في الاستجابة. يرجى تحديث الصفحة بعد لحظات.
        </p>
        <Link
          href="/quran"
          className="inline-block rounded-xl bg-[var(--brand-emerald)] text-white px-5 py-2.5 text-sm font-semibold"
        >
          العودة إلى فهرس السور
        </Link>
      </div>
    );
  }

  const surahMeta = SURAHS.find((s) => s.number === num);

  return (
    <>
      {surahMeta ? (
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "الرئيسية", path: "/" },
            { name: "القرآن الكريم", path: "/quran" },
            { name: surahMeta.nameAr, path: `/quran/${surahMeta.number}` },
          ])}
        />
      ) : null}
      <SurahReaderClient initialData={data} />
    </>
  );
}
