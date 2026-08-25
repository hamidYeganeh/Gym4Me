import type { AuthSession } from "@repo/api";
import type { TokenStorage } from "@repo/api/storage";
import { createLocalStorage, createMemoryStorage } from "@repo/api/storage";
import {
  getNativeSecureStore,
  type NativeSecureStore,
} from "./native-secure-store";

export type HydratedTokenStorage = TokenStorage & {
  hydrate(): Promise<AuthSession | null>;
  flush(): Promise<void>;
};

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as AuthSession;
    if (
      !session.accessToken ||
      !session.refreshToken ||
      !session.activeRole ||
      !session.user
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function createSecureSessionStorage(options: {
  key: string;
  resolveSecureStore?: () => Promise<NativeSecureStore>;
  browserStorage?: TokenStorage;
}): HydratedTokenStorage {
  const memory = createMemoryStorage();
  const browser =
    options.browserStorage ?? createLocalStorage(options.key);
  const resolveSecureStore =
    options.resolveSecureStore ?? getNativeSecureStore;
  let runtime: NativeSecureStore | null = null;
  let hydration: Promise<AuthSession | null> | null = null;
  let writes = Promise.resolve();
  let requestedSession: AuthSession | null | undefined;

  const persist = async (session: AuthSession | null) => {
    if (!runtime) runtime = await resolveSecureStore();
    if (!runtime.isNative) {
      await browser.set(session);
      return;
    }
    if (session) {
      await runtime.setItem(options.key, JSON.stringify(session));
    } else {
      await runtime.removeItem(options.key);
    }
    // Native builds must never retain the legacy plaintext session.
    await browser.set(null);
  };

  const hydrate = async () => {
    if (!hydration) {
      hydration = (async () => {
        runtime = await resolveSecureStore();
        if (!runtime.isNative) {
          const session = browser.get();
          if (requestedSession === undefined) memory.set(session);
          return memory.get();
        }

        const persisted = parseSession(await runtime.getItem(options.key));
        const legacy = browser.get();
        const session = persisted ?? legacy;
        if (requestedSession === undefined) memory.set(session);

        if (!persisted && legacy) {
          await runtime.setItem(options.key, JSON.stringify(legacy));
        }
        // Always remove malformed or successfully migrated plaintext data.
        await browser.set(null);
        return memory.get();
      })();
    }
    return hydration;
  };

  return {
    get() {
      return memory.get();
    },
    hydrate,
    set(session) {
      requestedSession = session;
      memory.set(session);
      writes = writes.then(async () => {
        await hydrate();
        memory.set(requestedSession ?? null);
        await persist(requestedSession ?? null);
      });
      return writes;
    },
    flush() {
      return writes;
    },
  };
}
