// DEPRECATED — os dados de exemplo (seeds) deixaram de existir quando a
// plataforma passou a usar o Supabase como fonte da verdade. Cada professor/
// aluno começa com o estado vazio e cria o próprio conteúdo, que é persistido
// no banco. Mantido apenas para compatibilidade de import.

import type { ContentState } from "../types";

export const SEED_CONTENT: ContentState = {
  checkpoints: [],
  watchedCheckpointIds: [],
  materialSections: [],
  materials: [],
  decks: [],
  flashcards: [],
};
