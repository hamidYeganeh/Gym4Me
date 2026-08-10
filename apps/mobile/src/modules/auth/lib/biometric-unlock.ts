import type { AuthSession } from "@repo/api";

const HAS_LOGGED_IN_KEY = "gym4me.auth.hasLoggedInBefore";
const UNLOCK_KEY = "gym4me.auth.biometricUnlock";

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

export function readBiometricUnlock(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(UNLOCK_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.refreshToken || !parsed.user || !parsed.activeRole) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persist a session snapshot for Face ID / fingerprint unlock after local lock. */
export function saveBiometricUnlock(session: AuthSession) {
  if (typeof window === "undefined") return;
  markLoggedInBefore();
  window.localStorage.setItem(UNLOCK_KEY, JSON.stringify(session));
}

export function clearBiometricUnlock() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(UNLOCK_KEY);
}

export function canOfferBiometricUnlock(): boolean {
  return hasLoggedInBefore() && Boolean(readBiometricUnlock()?.refreshToken);
}
