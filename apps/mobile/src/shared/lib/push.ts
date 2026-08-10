import type { DevicePlatform } from "@repo/api";
import { accountNotifications } from "./api";

const DEVICE_TOKEN_KEY = "gym4me.push.deviceToken";
const PUSH_PROMPTED_KEY = "gym4me.push.permissionPrompted";

export type PushReceivePermission =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale"
  | "unsupported";

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEVICE_TOKEN_KEY);
}

/** Whether the OS notification permission prompt was already shown (or skipped). */
export function hasPushPermissionBeenPrompted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PUSH_PROMPTED_KEY) === "1";
}

/** Persist that we already asked (or the user skipped the in-app prompt). */
export function markPushPermissionPrompted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PUSH_PROMPTED_KEY, "1");
  window.localStorage.setItem("gym4me.permission.prompted.notifications", "1");
}

/**
 * Request native push receive permission once.
 * No-op in browsers; marks the in-app prompt as shown either way.
 */
export async function requestPushReceivePermission(): Promise<PushReceivePermission> {
  markPushPermissionPrompted();

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return "unsupported";

    const { PushNotifications } = await import(
      "@capacitor/push-notifications"
    );

    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === "prompt") {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive === "granted") {
      await PushNotifications.register();
    }
    return permission.receive;
  } catch {
    return "unsupported";
  }
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
