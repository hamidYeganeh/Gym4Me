const DEV_API_BASE_URL = "http://localhost:8088/api/v1";
const PROD_API_BASE_URL = "https://api.gym4me.ir/api/v1";

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (typeof configured === "string" && configured.trim()) {
    return configured.replace(/\/$/, "");
  }
  return import.meta.env.PROD ? PROD_API_BASE_URL : DEV_API_BASE_URL;
}
