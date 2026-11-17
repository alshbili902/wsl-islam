import type { Metadata } from "next";
import { ReadingSettingsClient } from "@/components/reading/ReadingSettingsClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "إعدادات القراءة والخطوط المتقدمة",
  description:
    "خصص نوع الخط وحجمه وتباعد الأسطر وألوان الورق وإعدادات التباين والحركة عبر جميع صفحات القرآن والتفسير والأذكار والحديث.",
  path: "/reading-settings",
  noIndex: true,
});

export default function ReadingSettingsPage() {
  return <ReadingSettingsClient />;
}
