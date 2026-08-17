const DEV_API_BASE_URL = "http://192.168.3.106:8088/api/v1";
const PROD_API_BASE_URL = "https://api.gym4me.ir/api/v1";

/**
 * Resolves the versioned API base URL (`…/api/v1`).
 * Prefers `VITE_API_BASE_URL` from `.env.[mode]` / `.env.local`; falls back by mode.
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, "");
  }
  return import.meta.env.PROD ? PROD_API_BASE_URL : DEV_API_BASE_URL;
}
