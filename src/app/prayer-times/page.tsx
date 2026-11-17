import type { Metadata } from "next";
import { PrayerTimesClient } from "@/components/prayer/PrayerTimesClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "مواقيت الصلاة والتقويم الهجري",
  description:
    "مواقيت الصلاة الدقيقة حسب موقعك الجغرافي أو المدينة المختارة مع العد التنازلي للصلاة القادمة وطرق الحساب المعتمدة وتقويم أم القرى.",
  path: "/prayer-times",
});

export default function PrayerTimesPage() {
  return <PrayerTimesClient />;
}
