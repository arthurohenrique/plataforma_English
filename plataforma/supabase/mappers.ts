// Conversão pura entre linhas do Postgres (snake_case, timestamptz ISO) e os
// tipos do domínio (camelCase, epoch-ms). Mantém o resto do app alheio ao
// formato do banco.

import type {
  Checkpoint,
  Deck,
  Flashcard,
  Material,
  MaterialSection,
} from "../types";

// NOTA: as funções *ToRow (usadas em insert/upsert) deliberadamente NÃO
// enviam `created_at`. No insert o Postgres usa o default now(); no update
// (upsert de linha existente) omitir o campo preserva o timestamp original —
// evitando que cada edição reescreva/trunque o created_at do banco.

const toMs = (iso: string | null | undefined): number =>
  iso ? Date.parse(iso) : 0;
const toMsNullable = (iso: string | null | undefined): number | null =>
  iso ? Date.parse(iso) : null;
const toIso = (ms: number): string => new Date(ms).toISOString();

// ---------------------------------------------------------------------
// Checkpoints
// ---------------------------------------------------------------------
export type CheckpointRow = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_path: string;
  duration_min: number | null;
  order: number;
  created_at: string;
};

export function rowToCheckpoint(r: CheckpointRow): Checkpoint {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    videoUrl: r.video_url,
    videoPath: r.video_path || undefined,
    durationMin: r.duration_min ?? undefined,
    order: r.order,
    createdAt: toMs(r.created_at),
  };
}

export function checkpointToRow(c: Checkpoint) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    video_url: c.videoUrl,
    video_path: c.videoPath ?? "",
    duration_min: c.durationMin ?? null,
    order: c.order,
  };
}

// ---------------------------------------------------------------------
// Material sections
// ---------------------------------------------------------------------
export type MaterialSectionRow = {
  id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
};

export function rowToMaterialSection(r: MaterialSectionRow): MaterialSection {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    order: r.order,
    createdAt: toMs(r.created_at),
  };
}

export function materialSectionToRow(s: MaterialSection) {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    order: s.order,
  };
}

// ---------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------
export type MaterialRow = {
  id: string;
  section_id: string;
  display_name: string;
  file_name: string;
  mime: string;
  size: number;
  storage_path: string;
  order: number;
  created_at: string;
};

export function rowToMaterial(r: MaterialRow): Material {
  return {
    id: r.id,
    sectionId: r.section_id,
    displayName: r.display_name,
    fileName: r.file_name,
    mime: r.mime,
    size: r.size,
    storagePath: r.storage_path,
    order: r.order,
    createdAt: toMs(r.created_at),
  };
}

export function materialToRow(m: Material) {
  return {
    id: m.id,
    section_id: m.sectionId,
    display_name: m.displayName,
    file_name: m.fileName,
    mime: m.mime,
    size: m.size,
    storage_path: m.storagePath,
    order: m.order,
  };
}

// ---------------------------------------------------------------------
// Decks
// ---------------------------------------------------------------------
export type DeckRow = {
  id: string;
  owner_id: string;
  owner_scope: "aluno" | "professor";
  name: string;
  description: string;
  accent: string;
  created_at: string;
};

export function rowToDeck(r: DeckRow): Deck {
  return {
    id: r.id,
    ownerId: r.owner_id,
    ownerScope: r.owner_scope,
    name: r.name,
    description: r.description,
    accent: r.accent,
    createdAt: toMs(r.created_at),
  };
}

export function deckToRow(d: Deck) {
  return {
    id: d.id,
    owner_id: d.ownerId,
    owner_scope: d.ownerScope,
    name: d.name,
    description: d.description,
    accent: d.accent,
  };
}

// ---------------------------------------------------------------------
// Flashcards
// ---------------------------------------------------------------------
export type FlashcardRow = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  interval: number;
  repetitions: number;
  due_at: string;
  last_reviewed_at: string | null;
  created_at: string;
};

export function rowToFlashcard(r: FlashcardRow): Flashcard {
  return {
    id: r.id,
    deckId: r.deck_id,
    front: r.front,
    back: r.back,
    interval: r.interval,
    repetitions: r.repetitions,
    dueAt: toMs(r.due_at),
    lastReviewedAt: toMsNullable(r.last_reviewed_at),
    createdAt: toMs(r.created_at),
  };
}

export function flashcardToRow(c: Flashcard) {
  return {
    id: c.id,
    deck_id: c.deckId,
    front: c.front,
    back: c.back,
    interval: c.interval,
    repetitions: c.repetitions,
    due_at: toIso(c.dueAt),
    last_reviewed_at: c.lastReviewedAt ? toIso(c.lastReviewedAt) : null,
  };
}
