import type { Metadata } from "next";
import { BookmarksClient } from "@/components/bookmarks/BookmarksClient";

export const metadata: Metadata = {
  title: "المحفوظات والمفضلة",
  description:
    "جميع الآيات القرآنية والأحاديث النبوية والأذكار والمقالات التي قمت بحفظها محليًا على جهازك.",
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}
