export type ScrapeStatus = "success" | "blocked" | "error";

export interface ScraperSeedConfig {
  name: string;
  allowedDomains: string[];
  startUrls: string[];
  allowedPathPrefixes: string[];
  maxDepth: number;
  maxPages: number;
  requestDelayMs: number;
  concurrency: number;
}

export interface ExtractedLink {
  href: string;
  text: string;
  isInternal: boolean;
}

export interface ExtractedAsset {
  assetUrl: string;
  assetType: "image" | "icon";
  altText: string | null;
  title: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sourcePass: "visible_dom" | "interactive" | "merged";
  metadata: Record<string, unknown>;
}

export interface ExtractedOption {
  externalKey: string;
  rotulo: string | null;
  optionText: string | null;
  optionHtml: string | null;
  ordem: number;
  isCorrect: boolean;
  metadata: Record<string, unknown>;
}

export interface ExtractedQuestion {
  externalKey: string;
  questionType: string;
  promptText: string | null;
  promptHtml: string | null;
  points: number | null;
  ordem: number;
  answerKeys: string[];
  options: ExtractedOption[];
  metadata: Record<string, unknown>;
}

export interface ExtractedExercise {
  externalKey: string;
  title: string | null;
  instruction: string | null;
  exerciseType: string;
  ordem: number;
  questions: ExtractedQuestion[];
  metadata: Record<string, unknown>;
}

export interface ExtractedSession {
  externalKey: string;
  title: string | null;
  description: string | null;
  sessionType: string;
  ordem: number;
  sourcePass: "visible_dom" | "interactive" | "merged";
  exercises: ExtractedExercise[];
  metadata: Record<string, unknown>;
}

export interface ExtractedPagePayload {
  url: string;
  urlNormalized: string;
  canonicalUrl: string | null;
  title: string | null;
  h1: string | null;
  contentText: string;
  contentHtml: string;
  contentHash: string;
  links: ExtractedLink[];
  assets: ExtractedAsset[];
  sessions: ExtractedSession[];
  metadata: Record<string, unknown>;
}

export interface ScrapeCounters {
  okCount: number;
  blockedCount: number;
  errorCount: number;
  changedCount: number;
  unchangedCount: number;
  ignoredCount: number;
}
