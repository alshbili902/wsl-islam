import type { Metadata } from "next";
import { RamadanClient } from "@/components/ramadan/RamadanClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "رمضان والختمة الشخصية",
  description:
    "العد التنازلي الرسمي لشهر رمضان وفق تقويم أم القرى، متابعة الختمة الشخصية للأجزاء الثلاثين محليًا دون تسجيل، وأذكار رمضان وسنن العيد.",
  path: "/ramadan",
});

export default function RamadanPage() {
  return <RamadanClient />;
}
