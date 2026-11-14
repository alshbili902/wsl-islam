import { NextResponse } from "next/server";
import {
  fetchHadithSection,
  getCollectionSections,
  type HadithCollectionKey,
} from "@/lib/api/hadith";

const VALID_COLLECTIONS = new Set<HadithCollectionKey>([
  "nawawi",
  "bukhari",
  "muslim",
]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionParam = (searchParams.get("collection") ?? "nawawi") as HadithCollectionKey;
    const section = searchParams.get("section") ?? "1";
    const query = (searchParams.get("q") ?? "").trim().toLowerCase();

    if (!VALID_COLLECTIONS.has(collectionParam)) {
      return NextResponse.json(
        { error: "Invalid collection parameter." },
        { status: 400 }
      );
    }

    const payload = await fetchHadithSection(collectionParam, section);
    const sections = getCollectionSections(collectionParam);

    const filteredHadiths = query
      ? payload.hadiths.filter(
          (h) =>
            h.arabicText.toLowerCase().includes(query) ||
            h.englishText.toLowerCase().includes(query) ||
            String(h.hadithNumber).includes(query)
        )
      : payload.hadiths;

    return NextResponse.json(
      {
        ...payload,
        hadiths: filteredHadiths,
        totalInSection: payload.hadiths.length,
        sections,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load hadiths";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
