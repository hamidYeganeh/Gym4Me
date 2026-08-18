import { ACCOUNT_SESSION_KEY, createLocalStorage } from "@repo/api/storage";
import { createAccountAuthApi } from "@repo/api/auth";
import { createApiClient } from "@repo/api/client";
import { getApiBaseUrl } from "./env";
import { roleAppPath } from "./role-routes";

const storage = createLocalStorage(ACCOUNT_SESSION_KEY);

export const apiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  storage,
  onUnauthorized: () => {
    storage.set(null);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
      window.location.assign("/auth");
    }
  },
  onKycRequired: () => {
    if (typeof window === "undefined") return;
    const kycPath = roleAppPath(storage.get()?.activeRole, "kyc");
    if (!window.location.pathname.startsWith(kycPath)) {
      window.location.assign(kycPath);
    }
  },
});

export const accountAuth = createAccountAuthApi(apiClient);
