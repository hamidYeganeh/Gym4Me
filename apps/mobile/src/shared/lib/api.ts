import {
  createAccountCheckinApi,
} from "@repo/api/checkin";
import {
  createAccountClubsApi,
  createAccountClubSlotsApi,
  createAccountGamificationApi,
  createAccountKycApi,
  createAccountNotificationsApi,
  createAccountProfileApi,
  createAccountReferralApi,
  createAccountRolesApi,
  createAccountSupportApi,
  createClubOwnerClubsApi,
  createClubOwnerClubSlotsApi,
} from "@repo/api/account";
import {
  createAccountCoachingApi,
} from "@repo/api/coaching";
import {
  createAccountFinanceApi,
} from "@repo/api/finance";
import {
  createAccountMembershipsApi,
} from "@repo/api/memberships";
import {
  createAccountNutritionApi,
} from "@repo/api/nutrition";
import {
  createAccountOpsApi,
} from "@repo/api/ops";
import {
  createAccountProgressApi,
} from "@repo/api/progress";
import {
  createAccountSocialApi,
} from "@repo/api/social";
import {
  createClubStaffApi,
} from "@repo/api/staff";
import {
  createAccountWaitlistApi,
} from "@repo/api/waitlist";
import {
  createAccountLifecycleApi,
} from "@repo/api/lifecycle";
import {
  createAccountCalendarApi,
} from "@repo/api/calendar";
import {
  createBasicsLocationsApi,
  createBasicsRefsApi,
  createBasicsSportsApi,
} from "@repo/api/basics";
import {
  createAccountBookingsApi,
  createClubBookingsApi,
  createCoachBookingsApi,
  createCoachSlotsApi,
} from "@repo/api/booking";
import {
  createDiscoveryClassesApi,
  createDiscoveryClubsApi,
  createDiscoveryClubSlotsApi,
  createDiscoveryCoachesApi,
  createDiscoveryCoachSlotsApi,
} from "@repo/api/discovery";
import { createAnalyticsApi } from "@repo/api/analytics";
import { createMediaApi } from "@repo/api/media";
import { createArticlesApi } from "@repo/api/articles";
import { createBannersApi } from "@repo/api/banners";
import { apiClient, accountAuth } from "./api-client";

export { apiClient, accountAuth };

export const accountProfile = createAccountProfileApi(apiClient);
export const accountKyc = createAccountKycApi(apiClient);
export const accountRoles = createAccountRolesApi(apiClient);
export const accountReferral = createAccountReferralApi(apiClient);
export const accountClubs = createAccountClubsApi(apiClient);
export const clubOwnerClubs = createClubOwnerClubsApi(apiClient);
export const accountClubSlots = createAccountClubSlotsApi(apiClient);
export const clubOwnerClubSlots = createClubOwnerClubSlotsApi(apiClient);
export const accountNotifications = createAccountNotificationsApi(apiClient);
export const accountGamification = createAccountGamificationApi(apiClient);
export const accountProgress = createAccountProgressApi(apiClient);
export const accountFinance = createAccountFinanceApi(apiClient);
export const accountCoaching = createAccountCoachingApi(apiClient);
export const accountOps = createAccountOpsApi(apiClient);
export const accountMemberships = createAccountMembershipsApi(apiClient);
export const accountCheckin = createAccountCheckinApi(apiClient);
export const accountWaitlist = createAccountWaitlistApi(apiClient);
export const accountSocial = createAccountSocialApi(apiClient);
export const accountNutrition = createAccountNutritionApi(apiClient);
export const accountStaff = createClubStaffApi(apiClient);
export const accountSupport = createAccountSupportApi(apiClient);
export const accountLifecycle = createAccountLifecycleApi(apiClient);
export const accountCalendar = createAccountCalendarApi(apiClient);
export const discoveryClubs = createDiscoveryClubsApi(apiClient);
export const discoveryClubSlots = createDiscoveryClubSlotsApi(apiClient);
export const discoveryClasses = createDiscoveryClassesApi(apiClient);
export const discoveryCoaches = createDiscoveryCoachesApi(apiClient);
export const discoveryCoachSlots = createDiscoveryCoachSlotsApi(apiClient);
export const accountBookings = createAccountBookingsApi(apiClient);
export const clubBookings = createClubBookingsApi(apiClient);
export const coachBookings = createCoachBookingsApi(apiClient);
export const coachSlots = createCoachSlotsApi(apiClient);
export const basicsLocations = createBasicsLocationsApi(apiClient);
export const basicsSports = createBasicsSportsApi(apiClient);
export const basicsRefs = createBasicsRefsApi(apiClient);
export const analyticsApi = createAnalyticsApi(apiClient);
export const mediaApi = createMediaApi(apiClient);
export const articlesApi = createArticlesApi(apiClient);
export const bannersApi = createBannersApi(apiClient);

export function mediaFileUrl(mediaId: string | null | undefined): string | null {
  if (!mediaId) return null;
  return mediaApi.fileUrl(mediaId);
}

/** Mongo ObjectId used by live discovery APIs (vs static demo slugs). */
export function isDiscoveryApiId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}
