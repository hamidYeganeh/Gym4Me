import { createApiClient } from "@repo/api/v2";
import { accountApi } from "@repo/api/v2";
import { commerceApi } from "@repo/api/v2/commerce";
import { financeApi } from "@repo/api/v2/finance";
import { membershipsApi } from "@repo/api/v2/memberships";
import { notificationsApi } from "@repo/api/v2/notifications";
import { organizationsApi } from "@repo/api/v2/organizations";
import { supplyApi } from "@repo/api/v2/supply";
import { getApiBaseUrl } from "./env";

export const BUSINESS_SESSION_INVALIDATED = "gym4me:business-session-invalidated";
export const BUSINESS_SESSION_KEY = "gym4me.business.session.v2";

export type StoredBusinessSession = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

export function readStoredSession(): StoredBusinessSession | null {
  try {
    const raw = localStorage.getItem(BUSINESS_SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredBusinessSession>;
    return value.accessToken && value.refreshToken && value.userId
      ? (value as StoredBusinessSession)
      : null;
  } catch {
    return null;
  }
}

export function writeStoredSession(value: StoredBusinessSession | null): void {
  if (value) localStorage.setItem(BUSINESS_SESSION_KEY, JSON.stringify(value));
  else localStorage.removeItem(BUSINESS_SESSION_KEY);
}

export const apiClient = createApiClient({ baseUrl: getApiBaseUrl() });

export {
  accountApi,
  commerceApi,
  financeApi,
  membershipsApi,
  notificationsApi,
  organizationsApi,
  supplyApi,
};
