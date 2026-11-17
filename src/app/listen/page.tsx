import type { Metadata } from "next";
import { ListeningCenterClient } from "@/components/listen/ListeningCenterClient";
import { syncAndLoadReciterCatalog } from "@/lib/audio/catalog";
import { fetchVerifiedLectures } from "@/lib/api/lectures";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "مركز الاستماع — القرآن الكريم والمحاضرات الصوتية",
  description:
    "مركز الاستماع الشامل في منصة وصل الإسلامية: جميع قراء القرآن الكريم والروايات المعتمدة والمحاضرات والدروس الإسلامية الموثقة في مشغّل صوتي مستمر.",
  path: "/listen",
});

export const revalidate = 3600;

export default async function ListeningCenterPage() {
  const [snapshot, lectures] = await Promise.all([
    syncAndLoadReciterCatalog(),
    fetchVerifiedLectures({ lang: "all" }),
  ]);

  return (
    <ListeningCenterClient
      initialSnapshot={snapshot}
      initialLectures={lectures}
    />
  );
}
