import type { Metadata } from "next";
import { QuranDirectoryClient } from "@/components/quran/QuranDirectoryClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "القرآن الكريم — تصفح واستمع إلى السور الـ 114",
  description:
    "اقرأ سور القرآن الكريم بالرسم العثماني مع التفسير الميسر والترجمة الإنجليزية واستمع لتلاوات كبار القراء.",
  path: "/quran",
});

export default function QuranPage() {
  return <QuranDirectoryClient />;
}
