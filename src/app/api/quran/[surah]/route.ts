import { NextResponse } from "next/server";
import { fetchSurahDetail } from "@/lib/api/quran";

export async function GET(
  _req: Request,
  context: { params: Promise<{ surah: string }> }
) {
  try {
    const { surah } = await context.params;
    const surahNumber = Number(surah);
    if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return NextResponse.json(
        { error: "Surah number must be between 1 and 114." },
        { status: 400 }
      );
    }

    const payload = await fetchSurahDetail(surahNumber);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load surah";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
