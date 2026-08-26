import { Preferences } from "@capacitor/preferences";
import { getNativeSecureStore } from "@/shared/lib/native-secure-store";

const KEY_PREFIX = "gym4me.health-sync-queue.v1";
const INDEX_KEY = `${KEY_PREFIX}.index`;

function storageKey(userId: string): string {
  return `${KEY_PREFIX}.${userId}`;
}

async function readRaw(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const secure = await getNativeSecureStore();
  if (secure.isNative) {
    const encrypted = await secure.getItem(key);
    if (encrypted != null) return encrypted;
  }
  try {
    const { value } = await Preferences.get({ key });
    if (value != null) return value;
  } catch {
    // Fall through.
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;
  const secure = await getNativeSecureStore();
  if (secure.isNative) {
    await secure.setItem(key, value);
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore quota failures.
  }
  try {
    await Preferences.set({ key, value });
  } catch {
    // Best effort.
  }
}

async function clearRaw(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  const secure = await getNativeSecureStore();
  if (secure.isNative) {
    await secure.removeItem(key);
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
  try {
    await Preferences.remove({ key });
  } catch {
    // ignore
  }
}

async function readIndex(): Promise<string[]> {
  const raw = await readRaw(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(keys: string[]): Promise<void> {
  await writeRaw(INDEX_KEY, JSON.stringify([...new Set(keys)]));
}

export const healthSyncQueueStorage = {
  async loadJson(userId: string): Promise<string | null> {
    return readRaw(storageKey(userId));
  },

  async saveJson(userId: string, value: string): Promise<void> {
    const key = storageKey(userId);
    await writeRaw(key, value);
    const index = await readIndex();
    if (!index.includes(key)) {
      await writeIndex([...index, key]);
    }
  },

  async clearUser(userId: string): Promise<void> {
    const key = storageKey(userId);
    await clearRaw(key);
    const index = await readIndex();
    await writeIndex(index.filter((entry) => entry !== key));
  },

  async clearAll(): Promise<void> {
    const index = await readIndex();
    for (const key of index) {
      await clearRaw(key);
    }
    await clearRaw(INDEX_KEY);
  },
};
