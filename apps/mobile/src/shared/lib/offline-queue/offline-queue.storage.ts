import { Preferences } from "@capacitor/preferences";

const STORAGE_KEY = "gym4me.offline-queue.v1";

async function readRaw(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (value != null) return value;
  } catch {
    // Fall through to localStorage (web / Preferences unavailable).
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

async function writeRaw(value: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore quota / private mode failures; Preferences may still work.
  }
  try {
    await Preferences.set({ key: STORAGE_KEY, value });
  } catch {
    // Best effort on native Preferences.
  }
}

async function clearRaw(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    await Preferences.remove({ key: STORAGE_KEY });
  } catch {
    // ignore
  }
}

export const offlineQueueStorage = {
  async loadJson(): Promise<string | null> {
    return readRaw();
  },
  async saveJson(value: string): Promise<void> {
    await writeRaw(value);
  },
  async clear(): Promise<void> {
    await clearRaw();
  },
};
