import type { AuthState, ContentState } from "../types";

export const STORAGE_KEYS = {
  auth: "platform.auth.v1",
  content: "platform.content.v1",
} as const;

function safeWindow(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadAuth(): AuthState {
  const ls = safeWindow();
  if (!ls) return null;
  const raw = ls.getItem(STORAGE_KEYS.auth);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthState) {
  const ls = safeWindow();
  if (!ls) return;
  if (!auth) ls.removeItem(STORAGE_KEYS.auth);
  else ls.setItem(STORAGE_KEYS.auth, JSON.stringify(auth));
}

export function loadContent(): ContentState | null {
  const ls = safeWindow();
  if (!ls) return null;
  const raw = ls.getItem(STORAGE_KEYS.content);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ContentState;
  } catch {
    return null;
  }
}

export function saveContent(content: ContentState) {
  const ls = safeWindow();
  if (!ls) return;
  ls.setItem(STORAGE_KEYS.content, JSON.stringify(content));
}
