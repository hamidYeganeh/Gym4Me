import { createAdminAuthApi } from "@repo/api/auth";
import { createApiClient } from "@repo/api/client";
import { ADMIN_SESSION_KEY, createLocalStorage } from "@repo/api/storage";
import { getApiBaseUrl } from "./env";

const storage = createLocalStorage(ADMIN_SESSION_KEY);

export const apiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  storage,
  onUnauthorized: () => {
    storage.set(null);
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/sign-in")
    ) {
      window.location.assign("/sign-in");
    }
  },
});

export const adminAuth = createAdminAuthApi(apiClient);
