import type { AuthSession } from "@repo/api";
import { getNativeSecureStore } from "@/shared/lib/native-secure-store";

const HAS_LOGGED_IN_KEY = "gym4me.auth.hasLoggedInBefore";
const UNLOCK_KEY = "gym4me.auth.biometricUnlock";
type BiometricUnlockSession = Omit<AuthSession, "accessToken">;
let biometricWrites = Promise.resolve();

export function hasLoggedInBefore(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(HAS_LOGGED_IN_KEY) === "1";
}

export function markLoggedInBefore() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HAS_LOGGED_IN_KEY, "1");
}

export function clearLoggedInBefore() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HAS_LOGGED_IN_KEY);
}

function parseUnlock(raw: string | null): BiometricUnlockSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BiometricUnlockSession;
    if (!parsed.refreshToken || !parsed.user || !parsed.activeRole) return null;
    return {
      refreshToken: parsed.refreshToken,
      activeRole: parsed.activeRole,
      user: parsed.user,
      isNewUser: parsed.isNewUser,
    };
  } catch {
    return null;
  }
}

export async function readBiometricUnlock(): Promise<BiometricUnlockSession | null> {
  if (typeof window === "undefined") return null;
  await biometricWrites;
  const secureStore = await getNativeSecureStore();
  if (!secureStore.isNative) {
    return parseUnlock(window.localStorage.getItem(UNLOCK_KEY));
  }

  const persisted = parseUnlock(await secureStore.getItem(UNLOCK_KEY));
  const legacy = parseUnlock(window.localStorage.getItem(UNLOCK_KEY));
  if (!persisted && legacy) {
    await secureStore.setItem(UNLOCK_KEY, JSON.stringify(legacy));
  }
  // Native WebView storage must not retain the refresh token after migration.
  window.localStorage.removeItem(UNLOCK_KEY);
  return persisted ?? legacy;
}

/** Persist a session snapshot for Face ID / fingerprint unlock after local lock. */
export async function saveBiometricUnlock(session: AuthSession) {
  if (typeof window === "undefined") return;
  markLoggedInBefore();
  const snapshot: BiometricUnlockSession = {
    refreshToken: session.refreshToken,
    activeRole: session.activeRole,
    user: session.user,
    isNewUser: session.isNewUser,
  };
  biometricWrites = biometricWrites.then(async () => {
    const secureStore = await getNativeSecureStore();
    if (secureStore.isNative) {
      await secureStore.setItem(UNLOCK_KEY, JSON.stringify(snapshot));
      window.localStorage.removeItem(UNLOCK_KEY);
      return;
    }
    window.localStorage.setItem(UNLOCK_KEY, JSON.stringify(snapshot));
  });
  return biometricWrites;
}

export async function clearBiometricUnlock() {
  if (typeof window === "undefined") return;
  biometricWrites = biometricWrites.then(async () => {
    const secureStore = await getNativeSecureStore();
    if (secureStore.isNative) {
      await secureStore.removeItem(UNLOCK_KEY);
    }
    window.localStorage.removeItem(UNLOCK_KEY);
  });
  return biometricWrites;
}

export async function canOfferBiometricUnlock(): Promise<boolean> {
  return (
    hasLoggedInBefore() && Boolean((await readBiometricUnlock())?.refreshToken)
  );
}
