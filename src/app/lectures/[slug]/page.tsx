import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LectureDetailClient } from "@/components/lectures/LectureDetailClient";
import { fetchLectureBySlug, fetchVerifiedLectures } from "@/lib/api/lectures";

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
  return {
    title: `${lecture.titleAr} — ${lecture.speakerAr}`,
    description: lecture.descriptionAr,
    alternates: { canonical: `/lectures/${lecture.slug}` },
  };
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

  return <LectureDetailClient lecture={lecture} related={related} />;
}
