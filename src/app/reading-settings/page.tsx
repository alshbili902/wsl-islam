import type { Metadata } from "next";
import { ReadingSettingsClient } from "@/components/reading/ReadingSettingsClient";

export const metadata: Metadata = {
  title: "إعدادات القراءة والخطوط المتقدمة — وصل الإسلامية | Reading Preferences",
  description:
    "خصص نوع الخط وحجمه وتباعد الأسطر وألوان الورق وإعدادات التباين والحركة عبر جميع صفحات القرآن والتفسير والأذكار والحديث.",
  alternates: { canonical: "/reading-settings" },
};

export default function ReadingSettingsPage() {
  return <ReadingSettingsClient />;
}
