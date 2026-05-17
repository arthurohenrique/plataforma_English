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
  AttemptResult,
  AuthState,
  Checkpoint,
  ContentState,
  Question,
  Role,
} from "../types";
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

  // Questions
  upsertQuestion: (q: Question) => void;
  removeQuestion: (id: string) => void;

  // Checkpoints
  upsertCheckpoint: (c: Checkpoint) => void;
  removeCheckpoint: (id: string) => void;
  reorderCheckpoint: (id: string, direction: "up" | "down") => void;

  // Student progress
  recordAttempt: (questionId: string, result: AttemptResult) => void;
  markCheckpointWatched: (id: string) => void;

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
    if (stored) setContent(stored);
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

  const upsertQuestion = useCallback((q: Question) => {
    setContent((prev) => {
      const exists = prev.questions.some((x) => x.id === q.id);
      const questions = exists
        ? prev.questions.map((x) => (x.id === q.id ? q : x))
        : [...prev.questions, { ...q, id: q.id || uid("q") }];
      return { ...prev, questions };
    });
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setContent((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
      attempts: prev.attempts.filter((a) => a.questionId !== id),
    }));
  }, []);

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
      // Normalize order
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

  const recordAttempt = useCallback(
    (questionId: string, result: AttemptResult) => {
      setContent((prev) => {
        // Replace any previous attempt for this question
        const attempts = prev.attempts.filter((a) => a.questionId !== questionId);
        attempts.push({ questionId, result, at: Date.now() });
        return { ...prev, attempts };
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
      upsertQuestion,
      removeQuestion,
      upsertCheckpoint,
      removeCheckpoint,
      reorderCheckpoint,
      recordAttempt,
      markCheckpointWatched,
      resetAllContent,
    }),
    [
      ready,
      auth,
      content,
      login,
      logout,
      upsertQuestion,
      removeQuestion,
      upsertCheckpoint,
      removeCheckpoint,
      reorderCheckpoint,
      recordAttempt,
      markCheckpointWatched,
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
