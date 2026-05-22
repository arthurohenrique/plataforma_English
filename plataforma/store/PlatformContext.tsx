"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import {
  loadAuth,
  loadContent,
  saveAuth,
  saveContent,
} from "./storage";
import { SEED_CONTENT } from "./seeds";
import { platformRoutes } from "../routes";

type Ctx = {
  ready: boolean;
  auth: AuthState;
  content: ContentState;

  login: (username: string, role: Role) => void;
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
    file: { displayName: string; fileName: string; mime: string; size: number; dataUrl: string },
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

  resetAllContent: () => void;
};

const PlatformCtx = createContext<Ctx | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<AuthState>(null);
  const [content, setContent] = useState<ContentState>(SEED_CONTENT);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setAuth(loadAuth());
    const stored = loadContent();
    if (stored) {
      // Forward-compat: ignore campos legados (questions/attempts) e seed campos novos.
      setContent({
        checkpoints: stored.checkpoints ?? SEED_CONTENT.checkpoints,
        watchedCheckpointIds: stored.watchedCheckpointIds ?? [],
        materialSections:
          stored.materialSections ?? SEED_CONTENT.materialSections,
        materials: stored.materials ?? SEED_CONTENT.materials,
        decks: stored.decks ?? SEED_CONTENT.decks,
        flashcards: stored.flashcards ?? SEED_CONTENT.flashcards,
      });
    }
    setReady(true);
  }, []);

  // Persist content whenever it changes (after hydration)
  useEffect(() => {
    if (!ready) return;
    saveContent(content);
  }, [content, ready]);

  const login = useCallback(
    (username: string, role: Role) => {
      const next: AuthState = { username: username.trim() || "convidado", role };
      setAuth(next);
      saveAuth(next);
      router.push(
        role === "professor"
          ? platformRoutes.professor.home
          : platformRoutes.aluno.home,
      );
    },
    [router],
  );

  const logout = useCallback(() => {
    setAuth(null);
    saveAuth(null);
    router.push(platformRoutes.login);
  }, [router]);

  const upsertCheckpoint = useCallback((c: Checkpoint) => {
    setContent((prev) => {
      const exists = prev.checkpoints.some((x) => x.id === c.id);
      const checkpoints = exists
        ? prev.checkpoints.map((x) => (x.id === c.id ? c : x))
        : [
            ...prev.checkpoints,
            {
              ...c,
              id: c.id || uid("c"),
              order: c.order ?? prev.checkpoints.length,
            },
          ];
      checkpoints.sort((a, b) => a.order - b.order);
      checkpoints.forEach((cp, i) => (cp.order = i));
      return { ...prev, checkpoints };
    });
  }, []);

  const removeCheckpoint = useCallback((id: string) => {
    setContent((prev) => {
      const checkpoints = prev.checkpoints
        .filter((c) => c.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((c, i) => ({ ...c, order: i }));
      return {
        ...prev,
        checkpoints,
        watchedCheckpointIds: prev.watchedCheckpointIds.filter((x) => x !== id),
      };
    });
  }, []);

  const reorderCheckpoint = useCallback(
    (id: string, direction: "up" | "down") => {
      setContent((prev) => {
        const sorted = [...prev.checkpoints].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((c) => c.id === id);
        if (idx === -1) return prev;
        const swap = direction === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= sorted.length) return prev;
        [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
        sorted.forEach((c, i) => (c.order = i));
        return { ...prev, checkpoints: sorted };
      });
    },
    [],
  );

  const markCheckpointWatched = useCallback((id: string) => {
    setContent((prev) => {
      if (prev.watchedCheckpointIds.includes(id)) return prev;
      return {
        ...prev,
        watchedCheckpointIds: [...prev.watchedCheckpointIds, id],
      };
    });
  }, []);

  // ---------------------------------------------------------------------
  // Material sections
  // ---------------------------------------------------------------------

  const upsertMaterialSection = useCallback((section: MaterialSection) => {
    setContent((prev) => {
      const exists = prev.materialSections.some((s) => s.id === section.id);
      const list = exists
        ? prev.materialSections.map((s) =>
            s.id === section.id ? section : s,
          )
        : [
            ...prev.materialSections,
            {
              ...section,
              id: section.id || uid("ms"),
              order: section.order ?? prev.materialSections.length,
            },
          ];
      list.sort((a, b) => a.order - b.order);
      list.forEach((s, i) => (s.order = i));
      return { ...prev, materialSections: list };
    });
  }, []);

  const removeMaterialSection = useCallback((id: string) => {
    setContent((prev) => {
      const sections = prev.materialSections
        .filter((s) => s.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((s, i) => ({ ...s, order: i }));
      return {
        ...prev,
        materialSections: sections,
        materials: prev.materials.filter((m) => m.sectionId !== id),
      };
    });
  }, []);

  const reorderMaterialSection = useCallback(
    (id: string, direction: "up" | "down") => {
      setContent((prev) => {
        const sorted = [...prev.materialSections].sort(
          (a, b) => a.order - b.order,
        );
        const idx = sorted.findIndex((s) => s.id === id);
        if (idx === -1) return prev;
        const swap = direction === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= sorted.length) return prev;
        [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
        sorted.forEach((s, i) => (s.order = i));
        return { ...prev, materialSections: sorted };
      });
    },
    [],
  );

  // ---------------------------------------------------------------------
  // Materials (files)
  // ---------------------------------------------------------------------

  const addMaterial = useCallback(
    (
      sectionId: string,
      file: {
        displayName: string;
        fileName: string;
        mime: string;
        size: number;
        dataUrl: string;
      },
    ) => {
      setContent((prev) => {
        const ordersInSection = prev.materials.filter(
          (m) => m.sectionId === sectionId,
        );
        const nextOrder = ordersInSection.length;
        const material: Material = {
          id: uid("mat"),
          sectionId,
          displayName: file.displayName.trim() || file.fileName,
          fileName: file.fileName,
          mime: file.mime,
          size: file.size,
          dataUrl: file.dataUrl,
          order: nextOrder,
          createdAt: Date.now(),
        };
        return { ...prev, materials: [...prev.materials, material] };
      });
    },
    [],
  );

  const renameMaterial = useCallback((id: string, displayName: string) => {
    const next = displayName.trim();
    if (!next) return;
    setContent((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === id ? { ...m, displayName: next } : m,
      ),
    }));
  }, []);

  const removeMaterial = useCallback((id: string) => {
    setContent((prev) => {
      const target = prev.materials.find((m) => m.id === id);
      if (!target) return prev;
      const remaining = prev.materials.filter((m) => m.id !== id);
      // Renumera ordens dentro da seção
      const renumbered = remaining
        .filter((m) => m.sectionId === target.sectionId)
        .sort((a, b) => a.order - b.order)
        .map((m, i) => ({ ...m, order: i }));
      const others = remaining.filter((m) => m.sectionId !== target.sectionId);
      return { ...prev, materials: [...others, ...renumbered] };
    });
  }, []);

  const reorderMaterial = useCallback(
    (id: string, direction: "up" | "down") => {
      setContent((prev) => {
        const target = prev.materials.find((m) => m.id === id);
        if (!target) return prev;
        const sectionItems = prev.materials
          .filter((m) => m.sectionId === target.sectionId)
          .sort((a, b) => a.order - b.order);
        const idx = sectionItems.findIndex((m) => m.id === id);
        const swap = direction === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= sectionItems.length) return prev;
        [sectionItems[idx], sectionItems[swap]] = [
          sectionItems[swap],
          sectionItems[idx],
        ];
        const reordered = sectionItems.map((m, i) => ({ ...m, order: i }));
        const others = prev.materials.filter(
          (m) => m.sectionId !== target.sectionId,
        );
        return { ...prev, materials: [...others, ...reordered] };
      });
    },
    [],
  );

  const materialsBySection = useCallback(
    (sectionId: string): Material[] =>
      content.materials
        .filter((m) => m.sectionId === sectionId)
        .sort((a, b) => a.order - b.order),
    [content.materials],
  );

  // ---------------------------------------------------------------------
  // Decks / flashcards
  // ---------------------------------------------------------------------

  const upsertDeck = useCallback((deck: Deck) => {
    setContent((prev) => {
      const exists = prev.decks.some((d) => d.id === deck.id);
      const decks = exists
        ? prev.decks.map((d) => (d.id === deck.id ? deck : d))
        : [...prev.decks, { ...deck, id: deck.id || uid("d") }];
      return { ...prev, decks };
    });
  }, []);

  const removeDeck = useCallback((id: string) => {
    setContent((prev) => ({
      ...prev,
      decks: prev.decks.filter((d) => d.id !== id),
      flashcards: prev.flashcards.filter((c) => c.deckId !== id),
    }));
  }, []);

  const upsertFlashcard = useCallback((card: Flashcard) => {
    setContent((prev) => {
      const exists = prev.flashcards.some((c) => c.id === card.id);
      const flashcards = exists
        ? prev.flashcards.map((c) => (c.id === card.id ? card : c))
        : [...prev.flashcards, { ...card, id: card.id || uid("fc") }];
      return { ...prev, flashcards };
    });
  }, []);

  const removeFlashcard = useCallback((id: string) => {
    setContent((prev) => ({
      ...prev,
      flashcards: prev.flashcards.filter((c) => c.id !== id),
    }));
  }, []);

  const reviewFlashcard = useCallback((id: string, grade: Grade) => {
    setContent((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((c) =>
        c.id === id ? reschedule(c, grade) : c,
      ),
    }));
  }, []);

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

  const resetAllContent = useCallback(() => {
    setContent(SEED_CONTENT);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      auth,
      content,
      login,
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
      resetAllContent,
    }),
    [
      ready,
      auth,
      content,
      login,
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
      resetAllContent,
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
