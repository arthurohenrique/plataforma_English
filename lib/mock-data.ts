import type { Aula, Curso, Modulo, ProgressoAula } from "@/lib/types";

export const cursosMock: Curso[] = [
  {
    id: "curso-intermediario",
    titulo: "English for Professionals",
    descricao: "Curso focado em comunicacao para contexto corporativo.",
    nivel: "intermediario",
    publicado: true,
    ordem: 1,
  },
];

export const modulosMock: Modulo[] = [
  {
    id: "modulo-1",
    curso_id: "curso-intermediario",
    titulo: "Unit 1 - Workplace Introductions",
    descricao: "Como se apresentar com confianca em ambientes profissionais.",
    ordem: 1,
    publicado: true,
  },
  {
    id: "modulo-2",
    curso_id: "curso-intermediario",
    titulo: "Unit 2 - Meetings and Follow-up",
    descricao: "Estrategias de linguagem para reunioes e follow-ups.",
    ordem: 2,
    publicado: true,
  },
];

export const aulasMock: Aula[] = [
  {
    id: "aula-1",
    modulo_id: "modulo-1",
    titulo: "Lesson 1 - Introductions and Small Talk",
    descricao: "Estruturas de apresentacao e perguntas de conexao.",
    video_url: "https://www.youtube-nocookie.com/embed/ysz5S6PUM-U",
    video_tipo: "youtube",
    duracao_segundos: 840,
    materiais_url: ["/materiais/lesson-1-handout.pdf"],
    ordem: 1,
    publicada: true,
  },
  {
    id: "aula-2",
    modulo_id: "modulo-1",
    titulo: "Lesson 2 - Talking About Your Role",
    descricao: "Vocabulos-chave para descrever responsabilidades.",
    video_url: "https://www.youtube-nocookie.com/embed/jNQXAC9IVRw",
    video_tipo: "youtube",
    duracao_segundos: 760,
    materiais_url: ["/materiais/lesson-2-slides.pdf"],
    ordem: 2,
    publicada: true,
  },
];

export const progressoMock: ProgressoAula[] = [
  { aula_id: "aula-1", assistida: true, posicao_segundos: 840 },
  { aula_id: "aula-2", assistida: false, posicao_segundos: 312 },
];
