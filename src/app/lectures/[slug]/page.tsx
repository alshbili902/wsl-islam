import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LectureDetailClient } from "@/components/lectures/LectureDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchLectureBySlug, fetchVerifiedLectures } from "@/lib/api/lectures";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lecture = await fetchLectureBySlug(slug);
  if (!lecture) {
    return { title: "الدرس غير موجود" };
  }
  return buildPageMetadata({
    title: `${lecture.titleAr} — ${lecture.speakerAr}`,
    description: lecture.descriptionAr,
    path: `/lectures/${lecture.slug}`,
  });
}

export default async function LectureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lecture = await fetchLectureBySlug(slug);
  if (!lecture) {
    notFound();
  }

  const allSameCategory = await fetchVerifiedLectures({
    category: lecture.categoryId,
    lang: "all",
  });
  const related = allSameCategory.filter((item) => item.id !== lecture.id).slice(0, 3);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "المحاضرات والدروس", path: "/lectures" },
          { name: lecture.titleAr, path: `/lectures/${lecture.slug}` },
        ])}
      />
      <LectureDetailClient lecture={lecture} related={related} />
    </>
  );
}
