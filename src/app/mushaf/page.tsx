import type { Metadata } from "next";
import { MushafClient } from "@/components/mushaf/MushafClient";
import { fetchMushafPage } from "@/lib/api/mushaf";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "المصحف الشريف — القراءة التفاعلية",
  description:
    "تصفح المصحف الشريف بصفحاته الـ ٦٠٤ بالرسم العثماني الموثق مع تقسيم الأجزاء والأحزاب وعلامات السجود والربط المباشر بالتفسير والتلاوة.",
  path: "/mushaf",
});

export default async function MushafPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const rawPage = sp.page ? Number(sp.page) : null;
  const pageNumber =
    rawPage && Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 604
      ? rawPage
      : 1;

  const initialPageData = await fetchMushafPage(pageNumber);

  return (
    <MushafClient
      initialPageData={initialPageData}
      explicitPageRequested={Boolean(rawPage)}
    />
  );
}
