import type { Metadata } from "next";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export const metadata: Metadata = {
  title: "التنبيهات والتذكيرات الذكية — وصل الإسلامية | Smart Islamic Reminders",
  description:
    "إدارة تنبيهات مواقيت الصلاة والأذكار وورد القرآن الكريم وخطط الختمة وساعات الهدوء عبر وصل الإسلامية.",
  alternates: { canonical: "/notifications" },
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
