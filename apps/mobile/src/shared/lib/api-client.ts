import { ACCOUNT_SESSION_KEY } from "@repo/api/storage";
import { createAccountAuthApi } from "@repo/api/auth";
import { createApiClient } from "@repo/api/client";
import { createApiClient as createV2ApiClient } from "@repo/api/v2";
import { getApiBaseUrl } from "./env";
import { roleAppPath } from "./role-routes";
import { createSecureSessionStorage } from "./secure-session-storage";

export const API_NAVIGATION_EVENT = "gym4me:api-navigation";
export const SESSION_INVALIDATED_EVENT = "gym4me:session-invalidated";

function navigateFromApi(path: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<string>(API_NAVIGATION_EVENT, { detail: path }),
  );
}

export const accountSessionStorage = createSecureSessionStorage({
  key: ACCOUNT_SESSION_KEY,
});

export const apiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  storage: accountSessionStorage,
  onUnauthorized: () => {
    void accountSessionStorage.set(null);
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
    if (!window.location.pathname.startsWith("/auth")) {
      navigateFromApi("/auth");
    }
  },
  onKycRequired: () => {
    if (typeof window === "undefined") return;
    const kycPath = roleAppPath(
      accountSessionStorage.get()?.activeRole,
      "kyc",
    );
    if (!window.location.pathname.startsWith(kycPath)) {
      navigateFromApi(kycPath);
    }
  },
});

/** New P0/P1 API client. It shares the same securely persisted account session. */
export const v2ApiClient = createV2ApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => accountSessionStorage.get()?.accessToken ?? null,
});

export const accountAuth = createAccountAuthApi(apiClient);
