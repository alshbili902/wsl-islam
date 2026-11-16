import { NextResponse } from "next/server";
import { getPublicBuildInfo } from "@/lib/releases/build-info";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const buildInfo = getPublicBuildInfo(request.url);

  return NextResponse.json(
    {
      status: "ok",
      platform: "Wasl Islamic (وصل الإسلامية)",
      supabaseConfigured: isSupabaseServerConfigured(),
      buildCommitSha: buildInfo.commitSha,
      environment: buildInfo.environment,
      sources: {
        quranText: "https://api.alquran.cloud/v1",
        quranAudio: "https://mp3quran.net/api/v3",
        hadith: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1",
        prayerCalculation: "adhan + Umm al-Qura calendar",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
