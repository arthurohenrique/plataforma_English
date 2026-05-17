export type Role = "aluno" | "professor";

export type AuthState = {
  username: string;
  role: Role;
} | null;

import type { IconName } from "./components/ui/Icon";

export type Area = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  accent: string;
};

export type QuestionKind = "multiple-choice" | "open";

export type Question = {
  id: string;
  areaId: string;
  title: string;
  statement: string;
  kind: QuestionKind;
  options?: string[];
  correctIndex?: number;
  expectedAnswer?: string;
  hint?: string;
  createdAt: number;
};

export type Checkpoint = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMin?: number;
  order: number;
  createdAt: number;
};

export type AttemptResult = "correct" | "incorrect" | "revealed";

export type Attempt = {
  questionId: string;
  result: AttemptResult;
  at: number;
};

// Flashcards / Spaced repetition
// ---------------------------------------------------------------------------
// Decks are owned by either "aluno" or "professor" (kept separate by design).
// Each Flashcard carries simple SM-2-inspired scheduling fields so the
// student's local progress is preserved across sessions.

export type OwnerScope = "aluno" | "professor";

export type Deck = {
  id: string;
  ownerScope: OwnerScope;
  ownerUsername: string;
  name: string;
  description: string;
  accent: string;
  createdAt: number;
};

export type Grade = "again" | "good" | "easy";

export type Flashcard = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  /** integer days until next review; 0 means "study again today" */
  interval: number;
  /** how many successful repetitions in a row */
  repetitions: number;
  /** epoch ms when the card becomes due */
  dueAt: number;
  /** last review timestamp, null if never reviewed */
  lastReviewedAt: number | null;
  createdAt: number;
};

export type ContentState = {
  questions: Question[];
  checkpoints: Checkpoint[];
  attempts: Attempt[];
  watchedCheckpointIds: string[];
  decks: Deck[];
  flashcards: Flashcard[];
};
