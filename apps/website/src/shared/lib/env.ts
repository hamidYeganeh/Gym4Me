const DEV_API_BASE_URL = "http://192.168.3.106:8088/api/v1";
const PROD_API_BASE_URL = "https://api.gym4me.ir/api/v1";

/**
 * Resolves the versioned API base URL (`…/api/v1`).
 * SSR prefers `INTERNAL_API_BASE_URL`; the browser uses `NEXT_PUBLIC_API_BASE_URL`.
 * Falls back by NODE_ENV when unset.
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    const internalUrl = process.env.INTERNAL_API_BASE_URL;
    if (typeof internalUrl === "string" && internalUrl.trim().length > 0) {
      return internalUrl.replace(/\/$/, "");
    }
  }

  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, "");
  }

  return process.env.NODE_ENV === "production"
    ? PROD_API_BASE_URL
    : DEV_API_BASE_URL;
}
