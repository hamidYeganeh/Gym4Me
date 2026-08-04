import type { AuthSession } from "./types";

export type TokenStorage = {
  get(): AuthSession | null;
  set(session: AuthSession | null): void;
};

const MEMORY = new Map<string, AuthSession | null>();

/** In-memory fallback when `localStorage` is unavailable (SSR / tests). */
export function createMemoryStorage(key: string): TokenStorage {
  return {
    get() {
      return MEMORY.get(key) ?? null;
    },
    set(session) {
      MEMORY.set(key, session);
    },
  };
}

export function createLocalStorage(key: string): TokenStorage {
  if (typeof localStorage === "undefined") {
    return createMemoryStorage(key);
  }

  return {
    get() {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as AuthSession;
      } catch {
        return null;
      }
    },
    set(session) {
      try {
        if (!session) {
          localStorage.removeItem(key);
          return;
        }
        localStorage.setItem(key, JSON.stringify(session));
      } catch {
        // Quota / private mode — ignore; caller still holds session in memory.
      }
    },
  };
}

export const ACCOUNT_SESSION_KEY = "gym4me.account.session";
export const ADMIN_SESSION_KEY = "gym4me.admin.session";
