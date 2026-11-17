import type { Metadata } from "next";
import { ResourcesClient } from "@/components/resources/ResourcesClient";
import { DAILY_REMINDERS } from "@/data/ramadan";
import {
  getGlossaryTerms,
  getScholarlyResources,
} from "@/lib/data/repository";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "المصادر العلمية والمعجم الإسلامي والتذكيرات",
  description:
    "بوابة المصادر العلمية الرسمية الموثوقة مثل موقع الشيخ ابن باز واللجنة الدائمة ومجمع الملك فهد، مع المعجم الإسلامي والتذكيرات اليومية.",
  path: "/resources",
});

export default async function ResourcesPage() {
  const [resources, glossary] = await Promise.all([
    getScholarlyResources(),
    getGlossaryTerms(),
  ]);

  return (
    <ResourcesClient
      resources={resources}
      glossary={glossary}
      dailyReminders={DAILY_REMINDERS}
    />
  );
}
