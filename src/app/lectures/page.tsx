import type { Metadata } from "next";
import { LecturesClient } from "@/components/lectures/LecturesClient";
import { fetchVerifiedLectures } from "@/lib/api/lectures";

export const metadata: Metadata = {
  title: "مكتبة المحاضرات والدروس الإسلامية — وصل الإسلامية | Islamic Lectures",
  description:
    "استمع وشاهد محاضرات ودروساً إسلامية موثقة من إسلام هاوس والمنصات الشرعية المعتمدة في التفسير والعقيدة والسيرة والفقه والحديث.",
  alternates: { canonical: "/lectures" },
};

export const revalidate = 3600;

export default async function LecturesPage() {
  const initialLectures = await fetchVerifiedLectures({ lang: "all" });
  return <LecturesClient initialLectures={initialLectures} />;
}
