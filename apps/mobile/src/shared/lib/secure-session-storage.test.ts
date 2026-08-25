import type { AuthSession } from "@repo/api";
import { createMemoryStorage } from "@repo/api/storage";
import type { NativeSecureStore } from "./native-secure-store";
import { createSecureSessionStorage } from "./secure-session-storage";

const firstSession = {
  accessToken: "access-1",
  refreshToken: "refresh-1",
  activeRole: "athlete",
  user: { id: "665f0a1b2c3d4e5f67890101" },
} as AuthSession;

const secondSession = {
  ...firstSession,
  accessToken: "access-2",
  refreshToken: "refresh-2",
  activeRole: "coach",
} as AuthSession;

function secureStore(
  initial?: Record<string, string>,
): NativeSecureStore & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial ?? {}));
  return {
    isNative: true,
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async (key) => {
      values.delete(key);
    },
  };
}

describe("secure mobile session storage", () => {
  it("migrates a legacy native plaintext session and removes it", async () => {
    const browser = createMemoryStorage();
    browser.set(firstSession);
    const native = secureStore();
    const storage = createSecureSessionStorage({
      key: "session",
      browserStorage: browser,
      resolveSecureStore: async () => native,
    });

    await expect(storage.hydrate()).resolves.toEqual(firstSession);
    expect(storage.get()).toEqual(firstSession);
    expect(browser.get()).toBeNull();
    expect(JSON.parse(native.values.get("session")!)).toEqual(firstSession);
  });

  it("prefers the secure native session and deletes stale plaintext", async () => {
    const browser = createMemoryStorage();
    browser.set(firstSession);
    const native = secureStore({ session: JSON.stringify(secondSession) });
    const storage = createSecureSessionStorage({
      key: "session",
      browserStorage: browser,
      resolveSecureStore: async () => native,
    });

    await expect(storage.hydrate()).resolves.toEqual(secondSession);
    expect(browser.get()).toBeNull();
  });

  it("persists the latest rotated token pair and clears it on logout", async () => {
    const browser = createMemoryStorage();
    const native = secureStore();
    const storage = createSecureSessionStorage({
      key: "session",
      browserStorage: browser,
      resolveSecureStore: async () => native,
    });
    await storage.hydrate();

    void storage.set(firstSession);
    void storage.set(secondSession);
    await storage.flush();

    expect(storage.get()).toEqual(secondSession);
    expect(JSON.parse(native.values.get("session")!)).toEqual(secondSession);
    expect(browser.get()).toBeNull();

    await storage.set(null);
    expect(native.values.has("session")).toBe(false);
  });

  it("does not let hydration overwrite a session written during startup", async () => {
    const browser = createMemoryStorage();
    const native = secureStore({ session: JSON.stringify(firstSession) });
    const storage = createSecureSessionStorage({
      key: "session",
      browserStorage: browser,
      resolveSecureStore: async () => native,
    });

    await storage.set(secondSession);

    expect(storage.get()).toEqual(secondSession);
    expect(JSON.parse(native.values.get("session")!)).toEqual(secondSession);
  });

  it("keeps the browser fallback behavior outside native installations", async () => {
    const browser = createMemoryStorage();
    browser.set(firstSession);
    const storage = createSecureSessionStorage({
      key: "session",
      browserStorage: browser,
      resolveSecureStore: async () => ({
        isNative: false,
        getItem: async () => null,
        setItem: async () => undefined,
        removeItem: async () => undefined,
      }),
    });

    await storage.hydrate();
    await storage.set(secondSession);

    expect(browser.get()).toEqual(secondSession);
    expect(storage.get()).toEqual(secondSession);
  });
});
