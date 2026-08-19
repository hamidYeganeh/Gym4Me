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

function isGranted(result: DevicePermissionResult): boolean {
  return result === "granted";
}

async function queryBrowserPermission(
  name: string,
): Promise<"granted" | "denied" | "prompt"> {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return "prompt";
    }
    const status = await navigator.permissions.query({
      name: name as PermissionName,
    });
    if (status.state === "granted" || status.state === "denied") {
      return status.state;
    }
    return "prompt";
  } catch {
    return "prompt";
  }
}

async function checkNotificationsPermission(): Promise<DevicePermissionResult> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return "unsupported";

    const { PushNotifications } = await import(
      "@capacitor/push-notifications"
    );
    const permission = await PushNotifications.checkPermissions();
    return permission.receive;
  } catch {
    return "unsupported";
  }
}

async function checkLocationPermission(): Promise<DevicePermissionResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }
  return queryBrowserPermission("geolocation");
}

async function checkCameraPermission(): Promise<DevicePermissionResult> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return "unsupported";
  }
  return queryBrowserPermission("camera");
}

async function checkHealthPermission(): Promise<DevicePermissionResult> {
  try {
    const { Capacitor, Health } = await loadHealthPlugin();
    if (!Capacitor.isNativePlatform()) return "unsupported";

    const availability = await Health.isAvailable();
    if (!availability.available) return "unsupported";

    const auth = await Health.checkAuthorization({
      read: DEFAULT_HEALTH_READ_TYPES,
      write: DEFAULT_HEALTH_WRITE_TYPES,
    });

    return hasAnyReadAccess(auth) ? "granted" : "prompt";
  } catch {
    return "unsupported";
  }
}

/** Read current OS permission without prompting. */
export async function checkDevicePermission(
  kind: DevicePermissionKind,
): Promise<DevicePermissionResult> {
  switch (kind) {
    case "notifications":
      return checkNotificationsPermission();
    case "location":
      return checkLocationPermission();
    case "camera":
      return checkCameraPermission();
    case "health":
      return checkHealthPermission();
  }
}

async function requestLocationPermission(): Promise<DevicePermissionResult> {
  markDevicePermissionPrompted("location");
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }

  const existing = await checkLocationPermission();
  if (isGranted(existing)) return "granted";

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

  const existing = await checkCameraPermission();
  if (isGranted(existing)) return "granted";

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

    const existing = await Health.checkAuthorization({
      read: DEFAULT_HEALTH_READ_TYPES,
      write: DEFAULT_HEALTH_WRITE_TYPES,
    });
    if (hasAnyReadAccess(existing)) return "granted";

    const auth = await Health.requestAuthorization({
      read: DEFAULT_HEALTH_READ_TYPES,
      write: DEFAULT_HEALTH_WRITE_TYPES,
    });

    return hasAnyReadAccess(auth) ? "granted" : "denied";
  } catch {
    return "unsupported";
  }
}

/**
 * Request a single device permission.
 * No-ops (returns granted) when the OS already allows access.
 */
export async function requestDevicePermission(
  kind: DevicePermissionKind,
): Promise<DevicePermissionResult> {
  const existing = await checkDevicePermission(kind);
  if (isGranted(existing)) return "granted";

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

export function isDevicePermissionGranted(
  result: DevicePermissionResult,
): boolean {
  return isGranted(result);
}
