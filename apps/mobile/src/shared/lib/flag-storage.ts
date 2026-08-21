import { Preferences } from "@capacitor/preferences";

/**
 * First-launch flags that must survive WebView storage eviction on native.
 * localStorage is the synchronous source for reads; Capacitor Preferences
 * mirrors every write and re-seeds localStorage on cold start.
 */
export const FLAG_KEYS = {
  welcomeSeen: "gym4me.onboarding.welcomeSeen",
  /** @deprecated Device-global; prefer `onboardingProfileDoneKey(userId)`. */
  onboardingProfileDone: "gym4me.onboarding.profileDone",
} as const;

type KnownFlagKey = (typeof FLAG_KEYS)[keyof typeof FLAG_KEYS];

/** Per-account profile-onboarding completion key. */
export function onboardingProfileDoneKey(userId: string): string {
  return `${FLAG_KEYS.onboardingProfileDone}:${userId}`;
}

let hydration: Promise<void> | null = null;

/** Copy persisted flags from Capacitor Preferences into localStorage (once). */
export function hydrateFlags(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  hydration ??= (async () => {
    try {
      for (const key of Object.values(FLAG_KEYS)) {
        if (window.localStorage.getItem(key) != null) continue;
        const { value } = await Preferences.get({ key });
        if (value != null) {
          window.localStorage.setItem(key, value);
        }
      }
    } catch {
      // Best effort — fall back to whatever localStorage already has.
    }
  })();
  return hydration;
}

/**
 * Ensure a per-user onboarding flag is available synchronously after cold start.
 * Call after session user id is known (Preferences → localStorage).
 */
export async function hydrateOnboardingProfileFlag(
  userId: string,
): Promise<void> {
  if (typeof window === "undefined" || !userId) return;
  await hydrateFlags();
  const key = onboardingProfileDoneKey(userId);
  if (window.localStorage.getItem(key) != null) return;
  try {
    const { value } = await Preferences.get({ key });
    if (value != null) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Best effort.
  }
}

/** Synchronous flag read (call `hydrateFlags` first on boot paths). */
export function readFlag(key: KnownFlagKey | string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

/** Write-through: localStorage immediately, Preferences in the background. */
export function writeFlag(key: KnownFlagKey | string, value: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
  void Preferences.set({ key, value }).catch(() => undefined);
}
