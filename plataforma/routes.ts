export const platformRoutes = {
  root: "/plataforma",
  login: "/plataforma",
  aluno: {
    home: "/plataforma/aluno",
    materiais: "/plataforma/aluno/materiais",
    aulas: "/plataforma/aluno/aulas",
    flashcards: "/plataforma/aluno/flashcards",
    deck: (id: string) => `/plataforma/aluno/flashcards/${id}`,
    deckStudy: (id: string) => `/plataforma/aluno/flashcards/${id}/study`,
    deckCards: (id: string) => `/plataforma/aluno/flashcards/${id}/cards`,
  },
  professor: {
    home: "/plataforma/professor",
    materiais: "/plataforma/professor/materiais",
    aulas: "/plataforma/professor/aulas",
    flashcards: "/plataforma/professor/flashcards",
    deck: (id: string) => `/plataforma/professor/flashcards/${id}`,
    deckStudy: (id: string) => `/plataforma/professor/flashcards/${id}/study`,
    deckCards: (id: string) => `/plataforma/professor/flashcards/${id}/cards`,
  },
} as const;
