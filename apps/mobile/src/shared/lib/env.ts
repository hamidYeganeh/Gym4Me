const DEFAULT_API_BASE_URL = "http://localhost:8088/api/v1";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_API_BASE_URL;
}
