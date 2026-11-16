import type { ReleaseCategoryGroup, ReleaseCategoryId } from "@/types/islamic";

export interface RawChangedFile {
  path: string;
  status: "A" | "M" | "D" | "R" | string;
  diff: string;
  sourceSnippet?: string;
}

export interface AnalyzedReleaseResult {
  meaningful: boolean;
  releaseVersion: string;
  titleAr: string;
  summaryAr: string;
  categories: ReleaseCategoryGroup[];
  highlightsCount: number;
}

export declare const CATEGORY_DEFINITIONS: Record<
  ReleaseCategoryId,
  { category: ReleaseCategoryId; labelAr: string; labelEn: string }
>;

export declare function sanitizePublicArabicText(text: string, maxLength?: number): string;
export declare function bumpSemanticVersion(
  previousVersion: string,
  categories: ReleaseCategoryGroup[]
): string;
export declare function analyzeGitChanges(input: {
  files: RawChangedFile[];
  previousVersion?: string;
}): AnalyzedReleaseResult;
