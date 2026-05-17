import type { Checkpoint, ContentState, Question } from "../types";

const now = () => Date.now();

const questions: Question[] = [
  {
    id: "q-voc-1",
    areaId: "vocabulario",
    title: "Sinônimo de \"happy\"",
    statement: "Qual das opções abaixo é um sinônimo direto de \"happy\"?",
    kind: "multiple-choice",
    options: ["Sad", "Glad", "Angry", "Tired"],
    correctIndex: 1,
    hint: "Pense em \"glad to meet you\".",
    createdAt: now(),
  },
  {
    id: "q-voc-2",
    areaId: "vocabulario",
    title: "Tradução contextual",
    statement:
      "Traduza para o inglês de forma natural: \"Eu marquei uma reunião para amanhã às 10h.\"",
    kind: "open",
    expectedAnswer: "I scheduled a meeting for tomorrow at 10 a.m.",
    createdAt: now(),
  },
  {
    id: "q-pron-1",
    areaId: "pronuncia",
    title: "Som de TH",
    statement:
      "Qual palavra usa o mesmo som de TH de \"think\" (e não o de \"this\")?",
    kind: "multiple-choice",
    options: ["This", "Thirty", "Those", "Mother"],
    correctIndex: 1,
    createdAt: now(),
  },
  {
    id: "q-gram-1",
    areaId: "gramatica",
    title: "Present Perfect",
    statement: "Complete: \"I ___ (live) here for five years.\"",
    kind: "open",
    expectedAnswer: "have lived",
    hint: "Use Present Perfect com \"for\".",
    createdAt: now(),
  },
];

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

export const SEED_CONTENT: ContentState = {
  questions,
  checkpoints,
  attempts: [],
  watchedCheckpointIds: [],
};
