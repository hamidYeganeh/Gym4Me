import {
  ACCOUNT_SESSION_KEY,
  createAccountAuthApi,
  createAccountClubsApi,
  createAccountKycApi,
  createAccountProfileApi,
  createAccountReferralApi,
  createAccountRolesApi,
  createAnalyticsApi,
  createApiClient,
  createBasicsLocationsApi,
  createBasicsRefsApi,
  createBasicsSportsApi,
  createDiscoveryClubsApi,
  createDiscoveryClubSlotsApi,
  createDiscoveryCoachesApi,
  createLocalStorage,
  createMediaApi,
  createAccountNotificationsApi,
  createArticlesApi,
} from "@repo/api";
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
export const accountProfile = createAccountProfileApi(apiClient);
export const accountKyc = createAccountKycApi(apiClient);
export const accountRoles = createAccountRolesApi(apiClient);
export const accountReferral = createAccountReferralApi(apiClient);
export const accountClubs = createAccountClubsApi(apiClient);
export const accountNotifications = createAccountNotificationsApi(apiClient);
export const discoveryClubs = createDiscoveryClubsApi(apiClient);
export const discoveryClubSlots = createDiscoveryClubSlotsApi(apiClient);
export const discoveryCoaches = createDiscoveryCoachesApi(apiClient);
export const basicsLocations = createBasicsLocationsApi(apiClient);
export const basicsSports = createBasicsSportsApi(apiClient);
export const basicsRefs = createBasicsRefsApi(apiClient);
export const analyticsApi = createAnalyticsApi(apiClient);
export const mediaApi = createMediaApi(apiClient);
export const articlesApi = createArticlesApi(apiClient);

export function mediaFileUrl(mediaId: string | null | undefined): string | null {
  if (!mediaId) return null;
  return mediaApi.fileUrl(mediaId);
}

/** Mongo ObjectId used by live discovery APIs (vs static demo slugs). */
export function isDiscoveryApiId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}
