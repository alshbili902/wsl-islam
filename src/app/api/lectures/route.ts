import { NextResponse } from "next/server";
import { CURATED_SCHOLARLY_PLATFORMS, LECTURE_CATEGORIES } from "@/data/lectures";
import { fetchVerifiedLectures } from "@/lib/api/lectures";
import type { LectureCategoryId } from "@/types/islamic";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const langParam = searchParams.get("lang");
  const lang =
    langParam === "ar" || langParam === "en" ? langParam : ("all" as const);
  const category = (searchParams.get("category") || "all") as
    | LectureCategoryId
    | "all";
  const mediaParam = searchParams.get("media") || "all";
  const media =
    mediaParam === "audio" || mediaParam === "video" || mediaParam === "external"
      ? mediaParam
      : ("all" as const);
  const query = searchParams.get("q") || "";

  const lectures = await fetchVerifiedLectures({
    lang,
    category,
    media,
    query,
  });

  return NextResponse.json({
    lectures,
    categories: LECTURE_CATEGORIES,
    platforms: CURATED_SCHOLARLY_PLATFORMS,
  });
}
