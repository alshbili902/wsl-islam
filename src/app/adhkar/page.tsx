import type { Metadata } from "next";
import { Suspense } from "react";
import { AdhkarClient } from "@/components/adhkar/AdhkarClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "الأذكار والأدعية المأثورة",
  description:
    "أذكار الصباح والمساء، أذكار بعد الصلاة، أذكار النوم والاستيقاظ، وأدعية السفر والحفظ والرقية والأدعية القرآنية مع عدّاد تسبيح تفاعلي.",
  path: "/adhkar",
});

export default function AdhkarPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-44 rounded-3xl bg-[var(--wasl-surface)] animate-pulse" />
        </div>
      }
    >
      <AdhkarClient />
    </Suspense>
  );
}
