import type { Metadata } from "next";
import { ListeningLibraryClient } from "@/components/listen/ListeningLibraryClient";
import { syncAndLoadReciterCatalog } from "@/lib/audio/catalog";
import { fetchVerifiedLectures } from "@/lib/api/lectures";

export const metadata: Metadata = {
  title: "مكتبة الاستماع الشخصية — مركز الاستماع | وصل الإسلامية",
  description:
    "قراؤك المفضلون، السور والمحاضرات المحفوظة، قوائم التشغيل المخصصة، وسجل متابعة الاستماع على جهازك دون تسجيل.",
  alternates: { canonical: "/listen/library" },
};

export const revalidate = 3600;

export default async function ListeningLibraryPage() {
  const [snapshot, lectures] = await Promise.all([
    syncAndLoadReciterCatalog(),
    fetchVerifiedLectures({ lang: "all" }),
  ]);

  return <ListeningLibraryClient snapshot={snapshot} lectures={lectures} />;
}
