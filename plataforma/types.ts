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

export type ContentState = {
  questions: Question[];
  checkpoints: Checkpoint[];
  attempts: Attempt[];
  watchedCheckpointIds: string[];
};
