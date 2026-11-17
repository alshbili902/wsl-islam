import type { Metadata } from "next";
import { Suspense } from "react";
import { HadithLibraryClient } from "@/components/hadith/HadithLibraryClient";
import { fetchHadithSection, getCollectionSections } from "@/lib/api/hadith";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "مكتبة الحديث الشريف",
  description:
    "تصفح صحيح البخاري وصحيح مسلم والأربعين النووية بالنصوص العربية الأصلية والكتب والأبواب والتخريج الموثوق.",
  path: "/hadith",
});

export default async function HadithPage() {
  const initialData = await fetchHadithSection("nawawi", "1");
  const initialSections = getCollectionSections("nawawi");

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-44 rounded-3xl bg-[var(--wasl-surface)] animate-pulse" />
        </div>
      }
    >
      <HadithLibraryClient
        initialCollection="nawawi"
        initialSectionId="1"
        initialHadiths={initialData.hadiths}
        initialSectionTitleAr={initialData.sectionTitleAr}
        initialSectionTitleEn={initialData.sectionTitleEn}
        initialSections={initialSections}
      />
    </Suspense>
  );
}
