import { ARTICLES } from "@/data/articles";
import { GLOSSARY_TERMS, SCHOLARLY_RESOURCES } from "@/data/glossary-and-resources";
import { QUIZ_QUESTIONS } from "@/data/quiz-questions";
import { RADIO_STATIONS } from "@/data/radio-stations";
import {
  createSupabaseServerClient,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import type {
  Article,
  GlossaryTerm,
  QuizQuestion,
  RadioStation,
  ScholarlyResource,
} from "@/types/islamic";

/**
 * Unified content repository:
 * Queries Supabase tables when configured and populated; otherwise cleanly serves
 * verified bundled Islamic datasets without throwing or fabricating fallback data.
 */
export async function getRadioStations(): Promise<{
  stations: RadioStation[];
  source: "supabase" | "verified-local";
}> {
  const supabase = createSupabaseServerClient();
  if (supabase && isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabase
        .from("radio_stations")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return {
          source: "supabase",
          stations: data.map((row) => ({
            slug: row.slug,
            nameAr: row.name_ar,
            nameEn: row.name_en,
            descriptionAr: row.description_ar,
            descriptionEn: row.description_en,
            category: row.category,
            streamUrl: row.stream_url,
            fallbackUrl: row.fallback_url ?? undefined,
            streamType: row.stream_type,
            needsProxy: Boolean(row.needs_proxy),
            sourceOrgAr: row.source_org_ar,
            sourceOrgEn: row.source_org_en,
            isFeatured: Boolean(row.is_featured),
          })),
        };
      }
    } catch {
      // Fall through to verified bundled radio stations
    }
  }
  return { stations: RADIO_STATIONS, source: "verified-local" };
}

export async function getArticles(): Promise<{
  articles: Article[];
  source: "supabase" | "verified-local";
}> {
  const supabase = createSupabaseServerClient();
  if (supabase && isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return {
          source: "supabase",
          articles: data.map((row) => ({
            slug: row.slug,
            category: row.category,
            titleAr: row.title_ar,
            titleEn: row.title_en,
            summaryAr: row.summary_ar,
            summaryEn: row.summary_en,
            readingMinutes: row.reading_minutes,
            isFeatured: Boolean(row.is_featured),
            blocks: row.content_blocks,
            sources: row.sources,
          })),
        };
      }
    } catch {
      // Fall through to verified bundled articles
    }
  }
  return { articles: ARTICLES, source: "verified-local" };
}

export async function getQuizQuestions(): Promise<{
  questions: QuizQuestion[];
  source: "supabase" | "verified-local";
}> {
  const supabase = createSupabaseServerClient();
  if (supabase && isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("is_active", true);

      if (!error && data && data.length > 0) {
        return {
          source: "supabase",
          questions: data.map((row) => ({
            id: row.id,
            difficulty: row.difficulty,
            category: row.category,
            questionAr: row.question_ar,
            questionEn: row.question_en,
            optionsAr: row.options_ar,
            optionsEn: row.options_en,
            correctIndex: row.correct_index,
            explanationAr: row.explanation_ar,
            explanationEn: row.explanation_en,
            referenceAr: row.reference_ar,
            referenceEn: row.reference_en,
          })),
        };
      }
    } catch {
      // Fall through to verified bundled quiz bank
    }
  }
  return { questions: QUIZ_QUESTIONS, source: "verified-local" };
}

export async function getScholarlyResources(): Promise<ScholarlyResource[]> {
  const supabase = createSupabaseServerClient();
  if (supabase && isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabase
        .from("scholarly_resources")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          slug: row.slug,
          category: row.category,
          titleAr: row.title_ar,
          titleEn: row.title_en,
          descriptionAr: row.description_ar,
          descriptionEn: row.description_en,
          url: row.url,
          organizationAr: row.organization_ar,
          organizationEn: row.organization_en,
          languageTags: row.language_tags,
        }));
      }
    } catch {
      // Fall through
    }
  }
  return SCHOLARLY_RESOURCES;
}

export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  const supabase = createSupabaseServerClient();
  if (supabase && isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabase.from("glossary_terms").select("*");
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          slug: row.slug,
          termAr: row.term_ar,
          termEn: row.term_en,
          transliteration: row.transliteration,
          definitionAr: row.definition_ar,
          definitionEn: row.definition_en,
          category: row.category,
          referenceAr: row.reference_ar ?? undefined,
          referenceEn: row.reference_en ?? undefined,
        }));
      }
    } catch {
      // Fall through
    }
  }
  return GLOSSARY_TERMS;
}
