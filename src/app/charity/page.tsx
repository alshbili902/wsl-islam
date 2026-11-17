import type { Metadata } from "next";
import { CharityDirectoryClient } from "@/components/charity/CharityDirectoryClient";

export const metadata: Metadata = {
  title: "الصدقة والتبرع — دليل منصات التبرع السعودية الرسمية | وصل الإسلامية",
  description:
    "دليل تعريفي آمن يجمع منصات التبرع السعودية الرسمية (إحسان، المنصة الوطنية للتبرعات تبرع، جود الإسكان، وقفي، ساهم) مع روابط مباشرة لمواقعها المعتمدة.",
  alternates: { canonical: "/charity" },
  openGraph: {
    title: "الصدقة والتبرع — وصل الإسلامية",
    description:
      "أبواب الخير كثيرة، تصفّح أبرز منصات التبرع السعودية الرسمية وانتقل مباشرة إلى مواقعها المعتمدة بأمان.",
  },
};

export default function CharityPage() {
  return <CharityDirectoryClient />;
}
