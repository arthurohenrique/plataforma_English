export type UserRole = "aluno" | "professor" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  whatsapp?: string | null;
};

export type Conteudo = {
  id: string;
  titulo: string;
  descricao: string;
  nivel: "basico" | "intermediario" | "avancado" | "todos";
  publicado: boolean;
  ordem: number;
};

export type Modulo = {
  id: string;
  conteudo_id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  publicado: boolean;
};

export type Aula = {
  id: string;
  modulo_id: string;
  titulo: string;
  descricao: string;
  video_url: string;
  video_tipo: "youtube" | "vimeo" | "upload" | "externo";
  duracao_segundos: number;
  materiais_url: string[];
  ordem: number;
  publicada: boolean;
};
