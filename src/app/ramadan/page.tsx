import type { Metadata } from "next";
import { RamadanClient } from "@/components/ramadan/RamadanClient";

export const metadata: Metadata = {
  title: "رمضان والختمة الشخصية",
  description:
    "العد التنازلي الرسمي لشهر رمضان وفق تقويم أم القرى، متابعة الختمة الشخصية للأجزاء الثلاثين محليًا دون تسجيل، وأذكار رمضان وسنن العيد.",
};

export default function RamadanPage() {
  return <RamadanClient />;
}
