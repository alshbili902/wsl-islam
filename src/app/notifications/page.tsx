import type { Metadata } from "next";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "التنبيهات والتذكيرات الذكية",
  description:
    "إدارة تنبيهات مواقيت الصلاة والأذكار وورد القرآن الكريم وخطط الختمة وساعات الهدوء عبر وصل الإسلامية.",
  path: "/notifications",
  noIndex: true,
});

export default function NotificationsPage() {
  return <NotificationsClient />;
}
