import { Preferences } from "@capacitor/preferences";
import { getNativeSecureStore } from "@/shared/lib/native-secure-store";

const STORAGE_KEY = "gym4me.offline-queue.v1";

async function readRaw(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const secure = await getNativeSecureStore();
  if (secure.isNative) {
    const encrypted = await secure.getItem(STORAGE_KEY);
    if (encrypted != null) return encrypted;
    // One-time migration from the former unencrypted Preferences location.
    const legacy = await Preferences.get({ key: STORAGE_KEY }).catch(() => ({
      value: null,
    }));
    if (legacy.value != null) {
      await secure.setItem(STORAGE_KEY, legacy.value);
      await Preferences.remove({ key: STORAGE_KEY }).catch(() => undefined);
    }
    return legacy.value;
  }
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
  const secure = await getNativeSecureStore();
  if (secure.isNative) {
    await secure.setItem(STORAGE_KEY, value);
    return;
  }
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
  const secure = await getNativeSecureStore();
  if (secure.isNative) {
    await secure.removeItem(STORAGE_KEY);
    return;
  }
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
