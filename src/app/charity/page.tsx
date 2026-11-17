import type { Metadata } from "next";
import { CharityDirectoryClient } from "@/components/charity/CharityDirectoryClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "الصدقة والتبرع — دليل منصات التبرع السعودية الرسمية",
  description:
    "دليل تعريفي آمن يجمع منصات التبرع السعودية الرسمية (إحسان، المنصة الوطنية للتبرعات تبرع، جود الإسكان، وقفي، ساهم) مع روابط مباشرة لمواقعها المعتمدة.",
  path: "/charity",
});

export default function CharityPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "الصدقة والتبرع", path: "/charity" },
        ])}
      />
      <CharityDirectoryClient />
    </>
  );
}
