import type { Metadata } from "next";
import { QuranDirectoryClient } from "@/components/quran/QuranDirectoryClient";

export const metadata: Metadata = {
  title: "القرآن الكريم — تصفح واستمع إلى السور الـ 114",
  description:
    "اقرأ سور القرآن الكريم بالرسم العثماني مع التفسير الميسر والترجمة الإنجليزية واستمع لتلاوات كبار القراء.",
  alternates: { canonical: "/quran" },
};

export default function QuranPage() {
  return <QuranDirectoryClient />;
}
