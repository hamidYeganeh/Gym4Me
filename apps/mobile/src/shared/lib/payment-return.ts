import { Capacitor } from "@capacitor/core";
import { getApiBaseUrl } from "./env";

const PAYMENT_RETURN_PATHS = [
  /^\/athlete\/wallet$/,
  /^\/athlete\/memberships$/,
  /^\/athlete\/bookings\/[a-f\d]{24}$/i,
  /^\/owner\/subscription$/,
];

export function isPaymentReturnPath(value: string): boolean {
  return PAYMENT_RETURN_PATHS.some((pattern) => pattern.test(value));
}

export function getPaymentCallbackUrl(returnPath: string): string {
  if (!isPaymentReturnPath(returnPath)) {
    throw new Error("Unsupported payment return path");
  }
  if (Capacitor.isNativePlatform()) {
    const callback = new URL(`${getApiBaseUrl()}/payment-returns/native`);
    callback.searchParams.set("returnPath", returnPath);
    return callback.toString();
  }
  return `${window.location.origin}${returnPath}`;
}

export function parseNativePaymentReturn(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "com.gym4me.app:" || url.hostname !== "payment-return") {
    return null;
  }
  const returnPath = url.searchParams.get("returnPath") ?? "";
  if (!isPaymentReturnPath(returnPath)) return null;
  const next = new URL(returnPath, "https://mobile.gym4me.invalid");
  for (const key of ["checkoutId", "platformCheckoutId"] as const) {
    const item = url.searchParams.get(key);
    if (item && !/^[a-f\d]{24}$/i.test(item)) return null;
    if (item) next.searchParams.set(key, item);
  }
  const authority = url.searchParams.get("Authority");
  if (authority && authority.length > 120) return null;
  if (authority) next.searchParams.set("Authority", authority);
  const status = url.searchParams.get("Status");
  if (status && status !== "OK" && status !== "NOK") return null;
  if (status) next.searchParams.set("Status", status);
  return `${next.pathname}${next.search}`;
}
