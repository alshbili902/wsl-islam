import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReciterProfileClient } from "@/components/listen/ReciterProfileClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogReciterBySlug } from "@/lib/audio/catalog";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const reciter = await getCatalogReciterBySlug(slug);
  if (!reciter) {
    return {
      title: "القارئ غير موجود — مركز الاستماع",
    };
  }
  return buildPageMetadata({
    title: `${reciter.nameAr} — تلاوات القرآن الكريم`,
    description: `استمع إلى تلاوات القارئ ${reciter.nameAr} (${reciter.nameEn}) بعدد ${reciter.moshafs.length} مصحف/رواية عبر مركز الاستماع في وصل الإسلامية.`,
    path: `/listen/reciters/${reciter.slug}`,
  });
}

export default async function ReciterProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reciter = await getCatalogReciterBySlug(slug);
  if (!reciter) {
    notFound();
  }
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "مركز الاستماع", path: "/listen" },
          { name: "القراء", path: "/listen/reciters" },
          { name: reciter.nameAr, path: `/listen/reciters/${reciter.slug}` },
        ])}
      />
      <ReciterProfileClient reciter={reciter} />
    </>
  );
}
