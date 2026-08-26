import { ACCOUNT_SESSION_KEY } from "@repo/api/storage";
import { createAccountAuthApi } from "@repo/api/auth";
import { createApiClient } from "@repo/api/client";
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

export const accountAuth = createAccountAuthApi(apiClient);
