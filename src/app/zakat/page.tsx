import type { Metadata } from "next";
import { ZakatClient } from "@/components/zakat/ZakatClient";
import { getScholarlyResources } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "الزكاة والصدقات والمنصات الخيرية الرسمية",
  description:
    "دليل حساب زكاة المال وزكاة الفطر، حاسبة تقديرية للزكاة والنصاب، وروابط مباشرة للمنصات الخيرية السعودية الرسمية مثل إحسان وجود الإسكان وشفاء.",
};

export default async function ZakatPage() {
  const resources = await getScholarlyResources();
  const charityPlatforms = resources.filter((r) => r.category === "charity");

  return <ZakatClient charityPlatforms={charityPlatforms} />;
}
