import { createAdminAuthApi } from "@repo/api/auth";
import {
  createAdminAnalyticsApi,
  createAdminAuditApi,
  createAdminArticlesApi,
  createAdminBannersApi,
  createAdminBasicsApi,
  createAdminBookingsApi,
  createAdminClubsApi,
  createAdminClubSlotsApi,
  createAdminCoachingApi,
  createAdminFinanceApi,
  createAdminGamificationApi,
  createAdminKycApi,
  createAdminMembershipsApi,
  createAdminNotificationTemplatesApi,
  createAdminNutritionApi,
  createAdminProgressApi,
  createAdminSocialApi,
  createAdminSupportApi,
  createAdminUsersApi,
  createAdminVerificationApi,
} from "@repo/api/admin";
import { createAppConfigApi } from "@repo/api/app-config";
import { createApiClient } from "@repo/api/client";
import { createMediaApi } from "@repo/api/media";
import { ADMIN_SESSION_KEY, createLocalStorage } from "@repo/api/storage";
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
export const adminBanners = createAdminBannersApi(apiClient);
export const adminGamification = createAdminGamificationApi(apiClient);
export const adminBookings = createAdminBookingsApi(apiClient);
export const adminFinance = createAdminFinanceApi(apiClient);
export const adminAnalytics = createAdminAnalyticsApi(apiClient);
export const adminAudit = createAdminAuditApi(apiClient);
export const adminSocial = createAdminSocialApi(apiClient);
export const adminNutrition = createAdminNutritionApi(apiClient);
export const adminProgress = createAdminProgressApi(apiClient);
export const adminCoaching = createAdminCoachingApi(apiClient);
export const adminMemberships = createAdminMembershipsApi(apiClient);
export const adminNotificationTemplates =
  createAdminNotificationTemplatesApi(apiClient);
export const adminAppConfig = createAppConfigApi(apiClient);
export const mediaApi = createMediaApi(apiClient);
