"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type {
  AuthState,
  Checkpoint,
  ContentState,
  Deck,
  Flashcard,
  Grade,
  Material,
  MaterialSection,
  OwnerScope,
  Role,
} from "../types";
import { reschedule } from "../scheduler";
import { getSupabase, isSupabaseConfigured } from "../supabase/client";
import {
  checkpointToRow,
  deckToRow,
  flashcardToRow,
  materialSectionToRow,
  materialToRow,
  rowToCheckpoint,
  rowToDeck,
  rowToFlashcard,
  rowToMaterial,
  rowToMaterialSection,
} from "../supabase/mappers";
import { platformRoutes } from "../routes";

/** Resultado das ações de autenticação para a tela de login. */
export type AuthResult = { error: string | null; info?: string };

type Ctx = {
  ready: boolean;
  auth: AuthState;
  content: ContentState;
  configError: string | null;

  // Auth
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  logout: () => void;

  // Checkpoints
  upsertCheckpoint: (c: Checkpoint) => void;
  removeCheckpoint: (id: string) => void;
  reorderCheckpoint: (id: string, direction: "up" | "down") => void;

  // Student progress
  markCheckpointWatched: (id: string) => void;

  // Material sections + files
  upsertMaterialSection: (section: MaterialSection) => void;
  removeMaterialSection: (id: string) => void;
  reorderMaterialSection: (id: string, direction: "up" | "down") => void;
  addMaterial: (
    sectionId: string,
    file: {
      displayName: string;
      fileName: string;
      mime: string;
      size: number;
      storagePath: string;
    },
  ) => void;
  renameMaterial: (id: string, displayName: string) => void;
  removeMaterial: (id: string) => void;
  reorderMaterial: (id: string, direction: "up" | "down") => void;
  materialsBySection: (sectionId: string) => Material[];

  // Flashcards / spaced repetition
  upsertDeck: (deck: Deck) => void;
  removeDeck: (id: string) => void;
  upsertFlashcard: (card: Flashcard) => void;
  removeFlashcard: (id: string) => void;
  reviewFlashcard: (id: string, grade: Grade) => void;
  decksByScope: (scope: OwnerScope) => Deck[];
  cardsByDeck: (deckId: string) => Flashcard[];
};

const PlatformCtx = createContext<Ctx | null>(null);

const EMPTY_CONTENT: ContentState = {
  checkpoints: [],
  watchedCheckpointIds: [],
  materialSections: [],
  materials: [],
  decks: [],
  flashcards: [],
};

/** Gera um UUID válido (compatível com as colunas uuid do Postgres). */
function uid(_prefix?: string) {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  // Fallback p/ contextos não-seguros (HTTP sem TLS, browsers antigos), onde
  // crypto.randomUUID é indefinido — evita crash ao criar entidades.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function PlatformProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<AuthState>(null);
  const [content, setContent] = useState<ContentState>(EMPTY_CONTENT);
  const [configError, setConfigError] = useState<string | null>(null);

  // Refs para ler estado atual dentro de closures assíncronas sem re-criar
  // os callbacks a cada mudança.
  const contentRef = useRef(content);
  const authRef = useRef(auth);
  // Id do usuário cujo conteúdo já foi carregado — usado para evitar recarga em
  // refresh de token. Fica no escopo do componente (não dentro do effect) para
  // que o logout consiga resetá-lo e o re-login do mesmo usuário recarregue.
  const loadedUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  // -------------------------------------------------------------------
  // Carregamento de conteúdo a partir do Supabase
  // -------------------------------------------------------------------
  const fetchAllContent = useCallback(
    async (userId: string): Promise<ContentState> => {
      const supabase = getSupabase();
      const [cp, ms, mat, watched, decks] = await Promise.all([
        // created_at como desempate p/ ordem determinística quando "order" empata.
        supabase
          .from("checkpoints")
          .select("*")
          .order("order")
          .order("created_at"),
        supabase
          .from("material_sections")
          .select("*")
          .order("order")
          .order("created_at"),
        supabase
          .from("materials")
          .select("*")
          .order("order")
          .order("created_at"),
        supabase
          .from("watched_checkpoints")
          .select("checkpoint_id")
          .eq("user_id", userId),
        supabase.from("decks").select("*").eq("owner_id", userId),
      ]);

      const deckRows = decks.data ?? [];
      const deckIds = deckRows.map((d) => d.id);
      let cardRows: unknown[] = [];
      if (deckIds.length) {
        const fc = await supabase
          .from("flashcards")
          .select("*")
          .in("deck_id", deckIds);
        cardRows = fc.data ?? [];
      }

      return {
        checkpoints: (cp.data ?? []).map(rowToCheckpoint),
        watchedCheckpointIds: (watched.data ?? []).map(
          (w: { checkpoint_id: string }) => w.checkpoint_id,
        ),
        materialSections: (ms.data ?? []).map(rowToMaterialSection),
        materials: (mat.data ?? []).map(rowToMaterial),
        decks: deckRows.map(rowToDeck),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        flashcards: (cardRows as any[]).map(rowToFlashcard),
      };
    },
    [],
  );

  const fetchProfile = useCallback(
    async (user: { id: string; email?: string }): Promise<AuthState> => {
      const supabase = getSupabase();
      const query = () =>
        supabase
          .from("profiles")
          .select("role, display_name")
          .eq("id", user.id)
          .maybeSingle();

      let { data } = await query();
      if (!data) {
        // O trigger que cria o profile pode não ter rodado ainda logo após o
        // cadastro — tenta de novo uma vez.
        await wait(500);
        data = (await query()).data;
      }

      const fallbackName = user.email?.split("@")[0] || "aluno";
      return {
        userId: user.id,
        username: data?.display_name || fallbackName,
        role: data?.role === "professor" ? "professor" : "aluno",
      };
    },
    [],
  );

  const reload = useCallback(async () => {
    const a = authRef.current;
    if (!a) return;
    try {
      const next = await fetchAllContent(a.userId);
      setContent(next);
    } catch (e) {
      console.error("[platform] falha ao recarregar conteúdo", e);
    }
  }, [fetchAllContent]);

  // Persiste uma operação; em caso de erro, ressincroniza do servidor.
  const write = useCallback(
    async (
      work: () => PromiseLike<{ error: unknown } | { error: unknown }[]>,
    ) => {
      try {
        const res = await work();
        const list = Array.isArray(res) ? res : [res];
        const err = list.find((r) => r && r.error)?.error;
        if (err) throw err;
      } catch (e) {
        console.error("[platform] erro ao salvar — recarregando do servidor", e);
        await reload();
      }
    },
    [reload],
  );

  // -------------------------------------------------------------------
  // Auth: assina mudanças de sessão e carrega profile + conteúdo
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setConfigError(
        "Supabase não configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e " +
          "NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local.",
      );
      setReady(true);
      return;
    }

    let active = true;
    const supabase = getSupabase();

    async function handleSession(
      session: { user: { id: string; email?: string } } | null,
    ) {
      if (!active) return;
      const user = session?.user ?? null;

      if (!user) {
        loadedUserIdRef.current = null;
        setAuth(null);
        setContent(EMPTY_CONTENT);
        setReady(true);
        return;
      }

      if (loadedUserIdRef.current === user.id) {
        // Mesma sessão (ex.: refresh de token) — nada a recarregar.
        setReady(true);
        return;
      }

      loadedUserIdRef.current = user.id;
      setReady(false);
      try {
        const profile = await fetchProfile(user);
        if (!active) return;
        setAuth(profile);
        const c = await fetchAllContent(user.id);
        if (!active) return;
        setContent(c);
      } catch (e) {
        console.error("[platform] erro ao carregar sessão", e);
      } finally {
        if (active) setReady(true);
      }
    }

    // Semeia o estado a partir da sessão persistida — fonte confiável que
    // espera o storage/refresh resolver (ao contrário do evento INITIAL_SESSION,
    // que pode chegar com null antes de o storage carregar e derrubar a sessão).
    void supabase.auth.getSession().then(({ data }) => {
      void handleSession(
        data.session as { user: { id: string; email?: string } } | null,
      );
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // O INITIAL_SESSION com sessão é redundante (getSession acima já semeia),
      // mas o INITIAL_SESSION *null* é o transitório que derrubava o usuário pro
      // login — então ignoramos só esse caso. Eventos com sessão (SIGNED_IN
      // pós-OAuth, refresh) seguem sendo tratados.
      if (event === "INITIAL_SESSION" && !session) return;
      // Adiar para fora do callback evita deadlocks do supabase-js ao chamar
      // outras funções do client de dentro do listener.
      setTimeout(() => {
        void handleSession(
          session as { user: { id: string; email?: string } } | null,
        );
      }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchAllContent, fetchProfile]);

  // -------------------------------------------------------------------
  // Ações de autenticação
  // -------------------------------------------------------------------
  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return { error: error ? error.message : null };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Erro inesperado." };
      }
    },
    [],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) return { error: error.message };
        // Com confirmação de e-mail desligada, já vem sessão e o
        // onAuthStateChange cuida do redirect. Se vier sem sessão, é porque a
        // confirmação está ativa no dashboard.
        if (!data.session) {
          return {
            error: null,
            info: "Conta criada. Verifique seu e-mail para ativar o acesso.",
          };
        }
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Erro inesperado." };
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/plataforma` },
      });
      return { error: error ? error.message : null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erro inesperado." };
    }
  }, []);

  const logout = useCallback(() => {
    // Reseta o id carregado para que um re-login (inclusive do mesmo usuário)
    // recarregue o conteúdo em vez de cair no early-return de "mesma sessão".
    loadedUserIdRef.current = null;
    void getSupabase()
      .auth.signOut()
      .catch((e) => console.error("[platform] erro ao sair", e));
    setAuth(null);
    setContent(EMPTY_CONTENT);
    router.push(platformRoutes.login);
  }, [router]);

  // -------------------------------------------------------------------
  // Checkpoints
  // -------------------------------------------------------------------
  const upsertCheckpoint = useCallback(
    (c: Checkpoint) => {
      const prev = contentRef.current;
      const exists = prev.checkpoints.some((x) => x.id === c.id);
      const incoming: Checkpoint = exists
        ? c
        : { ...c, id: c.id || uid(), order: c.order ?? prev.checkpoints.length };
      let checkpoints = exists
        ? prev.checkpoints.map((x) => (x.id === c.id ? incoming : x))
        : [...prev.checkpoints, incoming];
      checkpoints = checkpoints
        .sort((a, b) => a.order - b.order)
        .map((cp, i) => ({ ...cp, order: i }));
      setContent({ ...prev, checkpoints });
      write(() =>
        getSupabase()
          .from("checkpoints")
          .upsert(checkpoints.map(checkpointToRow)),
      );
    },
    [write],
  );

  const removeCheckpoint = useCallback(
    (id: string) => {
      const prev = contentRef.current;
      const target = prev.checkpoints.find((c) => c.id === id);
      const checkpoints = prev.checkpoints
        .filter((c) => c.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((c, i) => ({ ...c, order: i }));
      setContent({
        ...prev,
        checkpoints,
        watchedCheckpointIds: prev.watchedCheckpointIds.filter((x) => x !== id),
      });
      write(async () => {
        if (target?.videoPath) {
          await getSupabase()
            .storage.from("materials")
            .remove([target.videoPath]);
        }
        const del = await getSupabase()
          .from("checkpoints")
          .delete()
          .eq("id", id);
        if (del.error) return del;
        return getSupabase()
          .from("checkpoints")
          .upsert(checkpoints.map(checkpointToRow));
      });
    },
    [write],
  );

  const reorderCheckpoint = useCallback(
    (id: string, direction: "up" | "down") => {
      const prev = contentRef.current;
      const sorted = [...prev.checkpoints].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((c) => c.id === id);
      if (idx === -1) return;
      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= sorted.length) return;
      [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
      const checkpoints = sorted.map((c, i) => ({ ...c, order: i }));
      setContent({ ...prev, checkpoints });
      write(() =>
        getSupabase()
          .from("checkpoints")
          .upsert(checkpoints.map(checkpointToRow)),
      );
    },
    [write],
  );

  const markCheckpointWatched = useCallback(
    (id: string) => {
      const a = authRef.current;
      if (!a) return;
      const prev = contentRef.current;
      if (prev.watchedCheckpointIds.includes(id)) return;
      setContent({
        ...prev,
        watchedCheckpointIds: [...prev.watchedCheckpointIds, id],
      });
      write(() =>
        getSupabase()
          .from("watched_checkpoints")
          .upsert(
            { user_id: a.userId, checkpoint_id: id },
            { onConflict: "user_id,checkpoint_id", ignoreDuplicates: true },
          ),
      );
    },
    [write],
  );

  // -------------------------------------------------------------------
  // Material sections
  // -------------------------------------------------------------------
  const upsertMaterialSection = useCallback(
    (section: MaterialSection) => {
      const prev = contentRef.current;
      const exists = prev.materialSections.some((s) => s.id === section.id);
      const incoming: MaterialSection = exists
        ? section
        : {
            ...section,
            id: section.id || uid(),
            order: section.order ?? prev.materialSections.length,
          };
      let list = exists
        ? prev.materialSections.map((s) =>
            s.id === section.id ? incoming : s,
          )
        : [...prev.materialSections, incoming];
      list = list
        .sort((a, b) => a.order - b.order)
        .map((s, i) => ({ ...s, order: i }));
      setContent({ ...prev, materialSections: list });
      write(() =>
        getSupabase()
          .from("material_sections")
          .upsert(list.map(materialSectionToRow)),
      );
    },
    [write],
  );

  const removeMaterialSection = useCallback(
    (id: string) => {
      const prev = contentRef.current;
      const paths = prev.materials
        .filter((m) => m.sectionId === id)
        .map((m) => m.storagePath)
        .filter(Boolean);
      const sections = prev.materialSections
        .filter((s) => s.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((s, i) => ({ ...s, order: i }));
      setContent({
        ...prev,
        materialSections: sections,
        materials: prev.materials.filter((m) => m.sectionId !== id),
      });
      write(async () => {
        if (paths.length) {
          await getSupabase().storage.from("materials").remove(paths);
        }
        // FK on delete cascade remove os materials no banco.
        const del = await getSupabase()
          .from("material_sections")
          .delete()
          .eq("id", id);
        if (del.error) return del;
        return getSupabase()
          .from("material_sections")
          .upsert(sections.map(materialSectionToRow));
      });
    },
    [write],
  );

  const reorderMaterialSection = useCallback(
    (id: string, direction: "up" | "down") => {
      const prev = contentRef.current;
      const sorted = [...prev.materialSections].sort(
        (a, b) => a.order - b.order,
      );
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx === -1) return;
      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= sorted.length) return;
      [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
      const list = sorted.map((s, i) => ({ ...s, order: i }));
      setContent({ ...prev, materialSections: list });
      write(() =>
        getSupabase()
          .from("material_sections")
          .upsert(list.map(materialSectionToRow)),
      );
    },
    [write],
  );

  // -------------------------------------------------------------------
  // Materials (arquivos) — o upload ao Storage é feito na tela; aqui só
  // registramos a linha com o storagePath resultante.
  // -------------------------------------------------------------------
  const addMaterial = useCallback(
    (
      sectionId: string,
      file: {
        displayName: string;
        fileName: string;
        mime: string;
        size: number;
        storagePath: string;
      },
    ) => {
      const prev = contentRef.current;
      const nextOrder = prev.materials.filter(
        (m) => m.sectionId === sectionId,
      ).length;
      const material: Material = {
        id: uid(),
        sectionId,
        displayName: file.displayName.trim() || file.fileName,
        fileName: file.fileName,
        mime: file.mime,
        size: file.size,
        storagePath: file.storagePath,
        order: nextOrder,
        createdAt: Date.now(),
      };
      setContent({ ...prev, materials: [...prev.materials, material] });
      write(() =>
        getSupabase().from("materials").insert(materialToRow(material)),
      );
    },
    [write],
  );

  const renameMaterial = useCallback(
    (id: string, displayName: string) => {
      const next = displayName.trim();
      if (!next) return;
      const prev = contentRef.current;
      setContent({
        ...prev,
        materials: prev.materials.map((m) =>
          m.id === id ? { ...m, displayName: next } : m,
        ),
      });
      write(() =>
        getSupabase()
          .from("materials")
          .update({ display_name: next })
          .eq("id", id),
      );
    },
    [write],
  );

  const removeMaterial = useCallback(
    (id: string) => {
      const prev = contentRef.current;
      const target = prev.materials.find((m) => m.id === id);
      if (!target) return;
      const remaining = prev.materials.filter((m) => m.id !== id);
      const renumbered = remaining
        .filter((m) => m.sectionId === target.sectionId)
        .sort((a, b) => a.order - b.order)
        .map((m, i) => ({ ...m, order: i }));
      const others = remaining.filter(
        (m) => m.sectionId !== target.sectionId,
      );
      setContent({ ...prev, materials: [...others, ...renumbered] });
      write(async () => {
        if (target.storagePath) {
          await getSupabase()
            .storage.from("materials")
            .remove([target.storagePath]);
        }
        const del = await getSupabase().from("materials").delete().eq("id", id);
        if (del.error) return del;
        return getSupabase()
          .from("materials")
          .upsert(renumbered.map(materialToRow));
      });
    },
    [write],
  );

  const reorderMaterial = useCallback(
    (id: string, direction: "up" | "down") => {
      const prev = contentRef.current;
      const target = prev.materials.find((m) => m.id === id);
      if (!target) return;
      const sectionItems = prev.materials
        .filter((m) => m.sectionId === target.sectionId)
        .sort((a, b) => a.order - b.order);
      const idx = sectionItems.findIndex((m) => m.id === id);
      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= sectionItems.length) return;
      [sectionItems[idx], sectionItems[swap]] = [
        sectionItems[swap],
        sectionItems[idx],
      ];
      const reordered = sectionItems.map((m, i) => ({ ...m, order: i }));
      const others = prev.materials.filter(
        (m) => m.sectionId !== target.sectionId,
      );
      setContent({ ...prev, materials: [...others, ...reordered] });
      write(() =>
        getSupabase().from("materials").upsert(reordered.map(materialToRow)),
      );
    },
    [write],
  );

  const materialsBySection = useCallback(
    (sectionId: string): Material[] =>
      content.materials
        .filter((m) => m.sectionId === sectionId)
        .sort((a, b) => a.order - b.order),
    [content.materials],
  );

  // -------------------------------------------------------------------
  // Decks / flashcards
  // -------------------------------------------------------------------
  const upsertDeck = useCallback(
    (deck: Deck) => {
      const a = authRef.current;
      if (!a) return;
      const prev = contentRef.current;
      const exists = prev.decks.some((d) => d.id === deck.id);
      const incoming: Deck = {
        ...deck,
        id: deck.id || uid(),
        ownerId: deck.ownerId || a.userId,
      };
      const decks = exists
        ? prev.decks.map((d) => (d.id === deck.id ? incoming : d))
        : [...prev.decks, incoming];
      setContent({ ...prev, decks });
      write(() => getSupabase().from("decks").upsert(deckToRow(incoming)));
    },
    [write],
  );

  const removeDeck = useCallback(
    (id: string) => {
      const prev = contentRef.current;
      setContent({
        ...prev,
        decks: prev.decks.filter((d) => d.id !== id),
        flashcards: prev.flashcards.filter((c) => c.deckId !== id),
      });
      // FK on delete cascade remove os flashcards no banco.
      write(() => getSupabase().from("decks").delete().eq("id", id));
    },
    [write],
  );

  const upsertFlashcard = useCallback(
    (card: Flashcard) => {
      const prev = contentRef.current;
      const exists = prev.flashcards.some((c) => c.id === card.id);
      const incoming: Flashcard = exists ? card : { ...card, id: card.id || uid() };
      const flashcards = exists
        ? prev.flashcards.map((c) => (c.id === card.id ? incoming : c))
        : [...prev.flashcards, incoming];
      setContent({ ...prev, flashcards });
      write(() =>
        getSupabase().from("flashcards").upsert(flashcardToRow(incoming)),
      );
    },
    [write],
  );

  const removeFlashcard = useCallback(
    (id: string) => {
      const prev = contentRef.current;
      setContent({
        ...prev,
        flashcards: prev.flashcards.filter((c) => c.id !== id),
      });
      write(() => getSupabase().from("flashcards").delete().eq("id", id));
    },
    [write],
  );

  const reviewFlashcard = useCallback(
    (id: string, grade: Grade) => {
      const prev = contentRef.current;
      const card = prev.flashcards.find((c) => c.id === id);
      if (!card) return;
      const updated = reschedule(card, grade);
      setContent({
        ...prev,
        flashcards: prev.flashcards.map((c) => (c.id === id ? updated : c)),
      });
      write(() =>
        getSupabase().from("flashcards").upsert(flashcardToRow(updated)),
      );
    },
    [write],
  );

  const decksByScope = useCallback(
    (scope: OwnerScope): Deck[] =>
      content.decks
        .filter((d) => d.ownerScope === scope)
        .sort((a, b) => b.createdAt - a.createdAt),
    [content.decks],
  );

  const cardsByDeck = useCallback(
    (deckId: string): Flashcard[] =>
      content.flashcards.filter((c) => c.deckId === deckId),
    [content.flashcards],
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      auth,
      content,
      configError,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      logout,
      upsertCheckpoint,
      removeCheckpoint,
      reorderCheckpoint,
      markCheckpointWatched,
      upsertMaterialSection,
      removeMaterialSection,
      reorderMaterialSection,
      addMaterial,
      renameMaterial,
      removeMaterial,
      reorderMaterial,
      materialsBySection,
      upsertDeck,
      removeDeck,
      upsertFlashcard,
      removeFlashcard,
      reviewFlashcard,
      decksByScope,
      cardsByDeck,
    }),
    [
      ready,
      auth,
      content,
      configError,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      logout,
      upsertCheckpoint,
      removeCheckpoint,
      reorderCheckpoint,
      markCheckpointWatched,
      upsertMaterialSection,
      removeMaterialSection,
      reorderMaterialSection,
      addMaterial,
      renameMaterial,
      removeMaterial,
      reorderMaterial,
      materialsBySection,
      upsertDeck,
      removeDeck,
      upsertFlashcard,
      removeFlashcard,
      reviewFlashcard,
      decksByScope,
      cardsByDeck,
    ],
  );

  return <PlatformCtx.Provider value={value}>{children}</PlatformCtx.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformCtx);
  if (!ctx) {
    throw new Error("usePlatform must be used inside <PlatformProvider>");
  }
  return ctx;
}

export { uid };
