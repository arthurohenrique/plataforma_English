export const platformRoutes = {
  root: "/plataforma",
  login: "/plataforma",
  aluno: {
    home: "/plataforma/aluno",
    area: (id: string) => `/plataforma/aluno/area/${id}`,
    aulas: "/plataforma/aluno/aulas",
  },
  professor: {
    home: "/plataforma/professor",
    area: (id: string) => `/plataforma/professor/area/${id}`,
    aulas: "/plataforma/professor/aulas",
  },
} as const;
