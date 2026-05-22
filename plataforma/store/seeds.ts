import type {
  Checkpoint,
  ContentState,
  Deck,
  Flashcard,
  Material,
  MaterialSection,
} from "../types";

const now = () => Date.now();

const checkpoints: Checkpoint[] = [
  {
    id: "c-1",
    title: "Aula 1 — Boas-vindas e Diagnóstico",
    description:
      "Apresentação do método, expectativas e diagnóstico inicial do seu inglês.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    durationMin: 12,
    order: 0,
    createdAt: now(),
  },
  {
    id: "c-2",
    title: "Aula 2 — Sons que travam o brasileiro",
    description:
      "Mapa rápido dos sons do inglês que precisam de atenção desde já.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    durationMin: 18,
    order: 1,
    createdAt: now(),
  },
  {
    id: "c-3",
    title: "Aula 3 — Vocabulário do dia a dia",
    description: "200 palavras que cobrem 80% das suas conversas iniciais.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    durationMin: 22,
    order: 2,
    createdAt: now(),
  },
];

const materialSections: MaterialSection[] = [
  {
    id: "ms-bem-vindo",
    title: "Boas-vindas",
    description:
      "Comece por aqui. Materiais introdutórios para alinhar expectativas.",
    order: 0,
    createdAt: now(),
  },
  {
    id: "ms-vocabulario",
    title: "Vocabulário essencial",
    description: "Listas e referências para você revisar no dia a dia.",
    order: 1,
    createdAt: now(),
  },
];

const materials: Material[] = [];

const decks: Deck[] = [
  {
    id: "d-teacher-essentials",
    ownerScope: "professor",
    ownerUsername: "Seeds",
    name: "Essential Verbs (A1)",
    description: "Verbos do dia a dia em inglês — base para qualquer conversa.",
    accent: "#C8102E",
    createdAt: now(),
  },
];

const flashcards: Flashcard[] = [
  {
    id: "fc-1",
    deckId: "d-teacher-essentials",
    front: "to wake up",
    back: "acordar",
    interval: 0,
    repetitions: 0,
    dueAt: now(),
    lastReviewedAt: null,
    createdAt: now(),
  },
  {
    id: "fc-2",
    deckId: "d-teacher-essentials",
    front: "to bring",
    back: "trazer",
    interval: 0,
    repetitions: 0,
    dueAt: now(),
    lastReviewedAt: null,
    createdAt: now(),
  },
  {
    id: "fc-3",
    deckId: "d-teacher-essentials",
    front: "to take",
    back: "pegar / levar",
    interval: 0,
    repetitions: 0,
    dueAt: now(),
    lastReviewedAt: null,
    createdAt: now(),
  },
  {
    id: "fc-4",
    deckId: "d-teacher-essentials",
    front: "to keep",
    back: "manter / guardar",
    interval: 0,
    repetitions: 0,
    dueAt: now(),
    lastReviewedAt: null,
    createdAt: now(),
  },
];

export const SEED_CONTENT: ContentState = {
  checkpoints,
  watchedCheckpointIds: [],
  materialSections,
  materials,
  decks,
  flashcards,
};
