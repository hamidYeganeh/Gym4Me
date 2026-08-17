const DEV_API_BASE_URL = "http://192.168.3.106:8088/api/v1";
const PROD_API_BASE_URL = "https://api.gym4me.ir/api/v1";

/**
 * Resolves the versioned API base URL (`…/api/v1`).
 * Prefers `NEXT_PUBLIC_API_BASE_URL` from `.env.[mode]` / `.env.local`; falls back by NODE_ENV.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, "");
  }
  return process.env.NODE_ENV === "production"
    ? PROD_API_BASE_URL
    : DEV_API_BASE_URL;
}
