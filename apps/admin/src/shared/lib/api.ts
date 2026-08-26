import {
  createAdminAnalyticsApi,
  createAdminAuditApi,
  createAdminArticlesApi,
  createAdminBannersApi,
  createAdminDiscoveryApi,
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
  createAdminDataRightsApi,
  createAdminVerificationApi,
} from "@repo/api/admin";
import { createAccountProfileApi } from "@repo/api/account";
import { createAppConfigApi } from "@repo/api/app-config";
import { createMediaApi } from "@repo/api/media";
import { apiClient } from "./api-client";

export { adminAuth, apiClient } from "./api-client";

export const accountProfile = createAccountProfileApi(apiClient);
export const adminUsers = createAdminUsersApi(apiClient);
export const adminDataRights = createAdminDataRightsApi(apiClient);
export const adminBasics = createAdminBasicsApi(apiClient);
export const adminClubs = createAdminClubsApi(apiClient);
export const adminClubSlots = createAdminClubSlotsApi(apiClient);
export const adminKyc = createAdminKycApi(apiClient);
export const adminVerification = createAdminVerificationApi(apiClient);
export const adminSupport = createAdminSupportApi(apiClient);
export const adminArticles = createAdminArticlesApi(apiClient);
export const adminBanners = createAdminBannersApi(apiClient);
export const adminDiscovery = createAdminDiscoveryApi(apiClient);
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
