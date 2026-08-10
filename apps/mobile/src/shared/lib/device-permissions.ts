import {
  DEFAULT_HEALTH_READ_TYPES,
  DEFAULT_HEALTH_WRITE_TYPES,
  hasAnyReadAccess,
  loadHealthPlugin,
} from "@/shared/lib/health/health-metrics";
import {
  markPushPermissionPrompted,
  requestPushReceivePermission,
  type PushReceivePermission,
} from "@/shared/lib/push";

export type DevicePermissionKind =
  | "notifications"
  | "location"
  | "camera"
  | "health";

export type DevicePermissionResult =
  | PushReceivePermission
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported";

/** Permissions requested after onboarding slides finish (in order). */
export const ONBOARDING_PERMISSION_ORDER: DevicePermissionKind[] = [
  "notifications",
  "location",
  "camera",
  "health",
];

const PROMPTED_KEY_PREFIX = "gym4me.permission.prompted.";

function promptedKey(kind: DevicePermissionKind): string {
  return `${PROMPTED_KEY_PREFIX}${kind}`;
}

export function hasDevicePermissionBeenPrompted(
  kind: DevicePermissionKind,
): boolean {
  if (typeof window === "undefined") return false;
  if (kind === "notifications") {
    return (
      window.localStorage.getItem(promptedKey(kind)) === "1" ||
      window.localStorage.getItem("gym4me.push.permissionPrompted") === "1"
    );
  }
  return window.localStorage.getItem(promptedKey(kind)) === "1";
}

export function markDevicePermissionPrompted(
  kind: DevicePermissionKind,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(promptedKey(kind), "1");
  if (kind === "notifications") {
    markPushPermissionPrompted();
  }
}

async function requestLocationPermission(): Promise<DevicePermissionResult> {
  markDevicePermissionPrompted("location");
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve("denied");
          return;
        }
        // Timeout / position unavailable still means the prompt was shown.
        resolve("denied");
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );
  });
}

async function requestCameraPermission(): Promise<DevicePermissionResult> {
  markDevicePermissionPrompted("camera");
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return "unsupported";
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    });
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch {
    return "denied";
  }
}

async function requestHealthPermission(): Promise<DevicePermissionResult> {
  markDevicePermissionPrompted("health");

  try {
    const { Capacitor, Health } = await loadHealthPlugin();
    if (!Capacitor.isNativePlatform()) return "unsupported";

    const availability = await Health.isAvailable();
    if (!availability.available) return "unsupported";

    const auth = await Health.requestAuthorization({
      read: DEFAULT_HEALTH_READ_TYPES,
      write: DEFAULT_HEALTH_WRITE_TYPES,
    });

    return hasAnyReadAccess(auth) ? "granted" : "denied";
  } catch {
    return "unsupported";
  }
}

/** Request a single device permission (marks the in-app prompt as shown). */
export async function requestDevicePermission(
  kind: DevicePermissionKind,
): Promise<DevicePermissionResult> {
  switch (kind) {
    case "notifications":
      return requestPushReceivePermission();
    case "location":
      return requestLocationPermission();
    case "camera":
      return requestCameraPermission();
    case "health":
      return requestHealthPermission();
  }
}

/** Skip without opening the OS dialog (still records that we asked in-app). */
export function skipDevicePermission(kind: DevicePermissionKind): void {
  markDevicePermissionPrompted(kind);
}
