import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    platform: "Wasl Islamic (وصل الإسلامية)",
    supabaseConfigured: isSupabaseServerConfigured(),
    sources: {
      quranText: "https://api.alquran.cloud/v1",
      quranAudio: "https://mp3quran.net/api/v3",
      hadith: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1",
      prayerCalculation: "adhan + Umm al-Qura calendar",
    },
  });
}
