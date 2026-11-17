import type { Metadata } from "next";
import { Suspense } from "react";
import { KnowledgeClient } from "@/components/knowledge/KnowledgeClient";
import { ALLAH_NAMES } from "@/data/names-of-allah";
import { getArticles, getScholarlyResources } from "@/lib/data/repository";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "المعرفة الإسلامية وأسماء الله الحسنى",
  description:
    "مقالات إسلامية موثقة في العقيدة والعبادات والسيرة النبوية وقصص الأنبياء ودليل المسلم الجديد، مع موسوعة أسماء الله الحسنى.",
  path: "/knowledge",
});

export default async function KnowledgePage() {
  const [{ articles }, resources] = await Promise.all([
    getArticles(),
    getScholarlyResources(),
  ]);

  const multilingualResources = resources.filter(
    (r) => r.category === "multilingual" || r.languageTags.length > 2
  );

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-44 rounded-3xl bg-[var(--wasl-surface)] animate-pulse" />
        </div>
      }
    >
      <KnowledgeClient
        articles={articles}
        allahNames={ALLAH_NAMES}
        multilingualResources={multilingualResources}
      />
    </Suspense>
  );
}
