export type Role = "aluno" | "professor";

export type AuthState = {
  userId: string;
  username: string;
  role: Role;
} | null;

export type Checkpoint = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMin?: number;
  order: number;
  createdAt: number;
};

// Material library
// ---------------------------------------------------------------------------
// O professor cria seções (com ordem definida por ele) e anexa arquivos a cada
// seção. O binário fica no Supabase Storage (bucket "materials"); o banco
// guarda apenas o caminho (storagePath) + metadados. O aluno baixa via signed
// URL gerada na hora.

export type MaterialSection = {
  id: string;
  title: string;
  description: string;
  order: number;
  createdAt: number;
};

export type Material = {
  id: string;
  sectionId: string;
  /** Nome exibido para o aluno (editável pelo professor). */
  displayName: string;
  /** Nome do arquivo original no upload. */
  fileName: string;
  /** MIME type detectado pelo navegador. */
  mime: string;
  /** Tamanho em bytes. */
  size: number;
  /** Caminho do arquivo no bucket "materials" do Supabase Storage. */
  storagePath: string;
  order: number;
  createdAt: number;
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
  /** id do usuário (auth.users) dono do deck. */
  ownerId: string;
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
  checkpoints: Checkpoint[];
  watchedCheckpointIds: string[];
  materialSections: MaterialSection[];
  materials: Material[];
  decks: Deck[];
  flashcards: Flashcard[];
};
