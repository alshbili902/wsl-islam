import type { Metadata } from "next";
import { UpdatesHistoryClient } from "@/components/releases/UpdatesHistoryClient";
import { fetchPublishedReleases } from "@/lib/releases/store";

export const metadata: Metadata = {
  title: "سجل التحديثات والإصدارات — وصل الإسلامية | Platform Updates",
  description:
    "السجل الكامل للتحديثات والميزات الجديدة والتحسينات المنشورة في منصة وصل الإسلامية بعد التحقق من نجاح نشر الإنتاج.",
  alternates: { canonical: "/updates" },
};

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const releases = await fetchPublishedReleases(50);
  return <UpdatesHistoryClient initialReleases={releases} />;
}
