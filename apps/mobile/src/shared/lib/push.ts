import type { DevicePlatform } from "@repo/api";
import { accountNotifications } from "./api";

const DEVICE_TOKEN_KEY = "gym4me.push.deviceToken";

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEVICE_TOKEN_KEY);
}

/** Register the FCM/APNs token with the API and remember it for logout revoke. */
export async function registerDeviceToken(
  token: string,
  platform: DevicePlatform,
): Promise<void> {
  await accountNotifications.registerDevice({ token, platform });
  window.localStorage.setItem(DEVICE_TOKEN_KEY, token);
}

/**
 * Best-effort revoke of the current device token.
 * Called before logout while the access token is still valid.
 */
export async function revokeCurrentDeviceToken(): Promise<void> {
  const token = readStoredToken();
  if (!token) return;
  try {
    await accountNotifications.revokeDevice(token);
  } catch {
    // Losing the revoke is acceptable; the API drops invalid tokens on next send.
  } finally {
    window.localStorage.removeItem(DEVICE_TOKEN_KEY);
  }
}
