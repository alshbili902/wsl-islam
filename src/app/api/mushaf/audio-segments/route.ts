import { NextRequest, NextResponse } from "next/server";
import { MUSHAF_TIMESTAMP_RECITERS } from "@/lib/api/mushaf";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reciterId = Number(searchParams.get("reciterId") ?? 7);
  const surah = Number(searchParams.get("surah") ?? 1);

  if (!MUSHAF_TIMESTAMP_RECITERS.some((r) => r.qdcId === reciterId)) {
    return NextResponse.json(
      { error: "Unsupported timestamp reciter ID." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    return NextResponse.json(
      { error: "Invalid surah number." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${surah}?segments=true`,
      {
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      audio_file?: {
        audio_url?: string;
        timestamps?: {
          verse_key: string;
          timestamp_from: number;
          timestamp_to: number;
        }[];
      };
    };

    if (!json.audio_file?.audio_url) {
      return NextResponse.json(
        { error: "Audio timestamps unavailable for this selection." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        reciterId,
        surah,
        audioUrl: json.audio_file.audio_url,
        timestamps: (json.audio_file.timestamps || []).map((t) => ({
          verseKey: t.verse_key,
          fromSec: t.timestamp_from / 1000,
          toSec: t.timestamp_to / 1000,
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch verified verse timestamps right now." },
      { status: 502 }
    );
  }
}
