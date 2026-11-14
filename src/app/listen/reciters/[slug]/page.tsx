import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReciterProfileClient } from "@/components/listen/ReciterProfileClient";
import { getCatalogReciterBySlug } from "@/lib/audio/catalog";

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
      title: "القارئ غير موجود — مركز الاستماع | وصل الإسلامية",
    };
  }
  return {
    title: `${reciter.nameAr} — تلاوات القرآن الكريم | وصل الإسلامية`,
    description: `استمع إلى تلاوات القارئ ${reciter.nameAr} (${reciter.nameEn}) بعدد ${reciter.moshafs.length} مصحف/رواية عبر مركز الاستماع في وصل الإسلامية.`,
    alternates: { canonical: `/listen/reciters/${reciter.slug}` },
  };
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
  return <ReciterProfileClient reciter={reciter} />;
}
