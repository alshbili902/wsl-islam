import type { Metadata } from "next";
import { CalendarClient } from "@/components/calendar/CalendarClient";

export const metadata: Metadata = {
  title: "التقويم الهجري — أم القرى",
  description:
    "التقويم الهجري وفق تقويم أم القرى، عرض الشهر الهجري الحالي والأيام البيض وصيام الإثنين والخميس والمناسبات الشرعية الموثقة.",
};

export default function CalendarPage() {
  return <CalendarClient />;
}
