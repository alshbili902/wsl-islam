import type { Metadata } from "next";
import { PrayerTimesClient } from "@/components/prayer/PrayerTimesClient";

export const metadata: Metadata = {
  title: "مواقيت الصلاة والتقويم الهجري",
  description:
    "مواقيت الصلاة الدقيقة حسب موقعك الجغرافي أو المدينة المختارة مع العد التنازلي للصلاة القادمة وطرق الحساب المعتمدة وتقويم أم القرى.",
};

export default function PrayerTimesPage() {
  return <PrayerTimesClient />;
}
