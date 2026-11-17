import type { Metadata } from "next";
import { UpdatesHistoryClient } from "@/components/releases/UpdatesHistoryClient";
import { fetchPublishedReleases } from "@/lib/releases/store";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "سجل التحديثات والإصدارات",
  description:
    "السجل الكامل للتحديثات والميزات الجديدة والتحسينات المنشورة في منصة وصل الإسلامية بعد التحقق من نجاح نشر الإنتاج.",
  path: "/updates",
});

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const releases = await fetchPublishedReleases(50);
  return <UpdatesHistoryClient initialReleases={releases} />;
}
