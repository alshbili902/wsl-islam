import { NextRequest, NextResponse } from "next/server";
import { fetchTafsirForVerse } from "@/lib/api/tafsir";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surah = Number(searchParams.get("surah") ?? 1);
  const ayah = Number(searchParams.get("ayah") ?? 1);
  const source = searchParams.get("source") ?? "ar-tafsir-ibn-kathir";

  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    return NextResponse.json(
      { error: "Invalid surah number (must be 1..114)." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(ayah) || ayah < 1) {
    return NextResponse.json(
      { error: "Invalid ayah number." },
      { status: 400 }
    );
  }

  try {
    const payload = await fetchTafsirForVerse(surah, ayah, source);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to reach verified tafsir source right now. No placeholder text has been generated.",
      },
      { status: 502 }
    );
  }
}
