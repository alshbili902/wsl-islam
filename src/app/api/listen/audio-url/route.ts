import { NextResponse } from "next/server";
import { getCatalogReciterBySlug, resolveSurahAudioUrlForVariant } from "@/lib/audio/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("reciter") || "";
  const moshafId = searchParams.get("moshaf") || "";
  const surahNumber = Number(searchParams.get("surah") || "0");

  if (!slug || !Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return NextResponse.json(
      { error: "Missing or invalid reciter slug / surah number." },
      { status: 400 }
    );
  }

  const reciter = await getCatalogReciterBySlug(slug);
  if (!reciter) {
    return NextResponse.json({ error: "Reciter not found" }, { status: 404 });
  }

  const variant =
    reciter.moshafs.find((m) => m.moshafId === moshafId) || reciter.moshafs[0];
  if (!variant) {
    return NextResponse.json({ error: "Recording variant not found" }, { status: 404 });
  }

  if (!variant.availableSurahs.includes(surahNumber)) {
    return NextResponse.json(
      {
        error: `Surah ${surahNumber} is not available in this recording.`,
        availableSurahs: variant.availableSurahs,
      },
      { status: 404 }
    );
  }

  const audioUrl = await resolveSurahAudioUrlForVariant(variant, surahNumber);
  if (!audioUrl) {
    return NextResponse.json(
      { error: "Upstream audio URL unavailable" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    reciterSlug: reciter.slug,
    moshafId: variant.moshafId,
    provider: variant.provider,
    surahNumber,
    audioUrl,
    hasVerseTiming: Boolean(variant.hasVerseTiming),
    qdcId: variant.qdcId,
  });
}
