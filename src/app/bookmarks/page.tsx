import type { Metadata } from "next";
import { BookmarksClient } from "@/components/bookmarks/BookmarksClient";
import { buildPageMetadata } from "@/lib/seo/config";

export const metadata: Metadata = buildPageMetadata({
  title: "المحفوظات والمفضلة",
  description:
    "جميع الآيات القرآنية والأحاديث النبوية والأذكار والمقالات التي قمت بحفظها محلياً على جهازك.",
  path: "/bookmarks",
  noIndex: true,
});

export default function BookmarksPage() {
  return <BookmarksClient />;
}
