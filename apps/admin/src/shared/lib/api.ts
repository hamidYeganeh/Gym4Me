import {
  ADMIN_SESSION_KEY,
  createAdminAuthApi,
  createAdminBasicsApi,
  createAdminArticlesApi,
  createAdminClubsApi,
  createAdminClubSlotsApi,
  createAdminKycApi,
  createAdminSupportApi,
  createAdminUsersApi,
  createAdminVerificationApi,
  createApiClient,
  createLocalStorage,
  createMediaApi,
} from "@repo/api";
import { getApiBaseUrl } from "./env";

const storage = createLocalStorage(ADMIN_SESSION_KEY);

export const apiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  storage,
  onUnauthorized: () => {
    storage.set(null);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/sign-in")) {
      window.location.assign("/sign-in");
    }
  },
});

export const adminAuth = createAdminAuthApi(apiClient);
export const adminUsers = createAdminUsersApi(apiClient);
export const adminBasics = createAdminBasicsApi(apiClient);
export const adminClubs = createAdminClubsApi(apiClient);
export const adminClubSlots = createAdminClubSlotsApi(apiClient);
export const adminKyc = createAdminKycApi(apiClient);
export const adminVerification = createAdminVerificationApi(apiClient);
export const adminSupport = createAdminSupportApi(apiClient);
export const adminArticles = createAdminArticlesApi(apiClient);
export const mediaApi = createMediaApi(apiClient);
