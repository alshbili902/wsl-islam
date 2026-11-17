import type { Metadata } from "next";
import { CalendarClient } from "@/components/calendar/CalendarClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "التقويم الهجري — أم القرى",
  description:
    "التقويم الهجري وفق تقويم أم القرى، عرض الشهر الهجري الحالي والأيام البيض وصيام الإثنين والخميس والمناسبات الشرعية الموثقة.",
  path: "/calendar",
});

export default function CalendarPage() {
  return <CalendarClient />;
}
