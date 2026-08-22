import type { AuthSession } from "./types";

export type TokenStorage = {
  get(): AuthSession | null;
  set(session: AuthSession | null): void;
};

/** In-memory fallback when `localStorage` is unavailable (SSR / tests). */
export function createMemoryStorage(): TokenStorage {
  let current: AuthSession | null = null;
  return {
    get() {
      return current;
    },
    set(session) {
      current = session;
    },
  };
}

export function createLocalStorage(key: string): TokenStorage {
  if (typeof window === "undefined") {
    return createMemoryStorage();
  }

  const browserStorage = window.localStorage;

  return {
    get() {
      try {
        const raw = browserStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as AuthSession;
      } catch {
        return null;
      }
    },
    set(session) {
      try {
        if (!session) {
          browserStorage.removeItem(key);
          return;
        }
        browserStorage.setItem(key, JSON.stringify(session));
      } catch {
        // Quota / private mode — ignore; caller still holds session in memory.
      }
    },
  };
}

export const ACCOUNT_SESSION_KEY = "gym4me.account.session";
export const ADMIN_SESSION_KEY = "gym4me.admin.session";
