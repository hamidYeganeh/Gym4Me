export {
  createAdminUsersApi,
  type AdminUsersApi,
} from "./users.client";
export { adminUsersEndpoints } from "./users.endpoint";
export type {
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AdminUpdateUserRolesInput,
  AdminUpdateUserStatusInput,
  AdminUserActivationInput,
  ListAdminUsersQuery,
} from "./users.dto";
export { adminUsersKeys } from "./users.keys";

export {
  createAdminBasicsApi,
  type AdminBasicsApi,
} from "./basics.client";
export { adminBasicsEndpoints } from "./basics.endpoint";
export type {
  AdminChoiceOptionInput,
  AdminCreateChoiceGroupInput,
  AdminCreateLocationInput,
  AdminCreateRefItemInput,
  AdminCreateSportInput,
  AdminRefListResponse,
  AdminUpdateChoiceGroupInput,
  AdminUpdateLocationInput,
  AdminUpdateRefItemInput,
  AdminUpdateSportInput,
  ListAdminLocationsQuery,
  ListAdminSportsQuery,
} from "./basics.dto";
export { adminBasicsKeys } from "./basics.keys";

export {
  createAdminKycApi,
  type AdminKycApi,
} from "./kyc.client";
export { adminKycEndpoints } from "./kyc.endpoint";
export type {
  AdminKycRequest,
  AdminKycUserSummary,
  ListAdminKycQuery,
  ReviewKycInput,
} from "./kyc.dto";
export { adminKycKeys } from "./kyc.keys";

export {
  createAdminVerificationApi,
  type AdminVerificationApi,
} from "./verification.client";
export { adminVerificationEndpoints } from "./verification.endpoint";
export type {
  CoachVerificationItem,
  CoachVerificationUser,
  ListClubReviewsQuery,
  ListCoachVerificationsQuery,
  ReviewCoachResponse,
  ReviewVerificationInput,
} from "./verification.dto";
export { adminVerificationKeys } from "./verification.keys";

export {
  createAdminClubsApi,
  type AdminClubsApi,
} from "./clubs.client";
export { adminClubsEndpoints } from "./clubs.endpoint";
export type {
  AdminClubReviewsQuery,
  AdminClubsListQuery,
  AdminCreateBranchInput,
  AdminCreateClubInput,
  Club,
  ClubUserReview,
  CreateClubInput,
  UpdateClubInput,
} from "./clubs.dto";
export { adminClubsKeys } from "./clubs.keys";

export {
  createAdminClubSlotsApi,
  type AdminClubSlotsApi,
} from "./club-slots.client";
export { adminClubSlotsEndpoints } from "./club-slots.endpoint";
export type {
  CancelSlotOccurrenceInput,
  ClubClass,
  ClubClassesList,
  ClubSlot,
  ClubSlotsList,
  ClubSpace,
  ClubSpacesList,
  CreateClubClassInput,
  CreateClubSlotInput,
  CreateClubSpaceInput,
  UpdateClubClassInput,
  UpdateClubSlotInput,
  UpdateClubSpaceInput,
} from "./club-slots.dto";
export { adminClubSlotsKeys } from "./club-slots.keys";

export {
  createAdminBookingsApi,
  type AdminBookingsApi,
} from "./bookings.client";
export { adminBookingsEndpoints } from "./bookings.endpoint";
export type { AdminBookingsListQuery } from "./bookings.dto";
export { adminBookingsKeys } from "./bookings.keys";

export {
  createAdminFinanceApi,
  type AdminFinanceApi,
} from "./finance.client";
export { adminFinanceEndpoints } from "./finance.endpoint";
export type {
  AdminLedgerEntry,
  AdminLedgerLine,
  AdminLedgerPage,
  LedgerEntryKind,
  ListAdminLedgerQuery,
  ListAdminPaymentsQuery,
  SettlePayoutInput,
} from "./finance.dto";
export { adminFinanceKeys } from "./finance.keys";

export {
  createAdminAnalyticsApi,
  type AdminAnalyticsApi,
} from "./analytics.client";
export { adminAnalyticsEndpoints } from "./analytics.endpoint";
export type { AdminAnalyticsOverview, DailyPoint } from "./analytics.dto";
export { adminAnalyticsKeys } from "./analytics.keys";

export {
  createAdminNotificationTemplatesApi,
  type AdminNotificationTemplatesApi,
} from "./notification-templates.client";
export { adminNotificationTemplatesEndpoints } from "./notification-templates.endpoint";
export type {
  CreateNotificationTemplateInput,
  ListNotificationTemplatesQuery,
  NotificationChannelSetting,
  NotificationSmsSetting,
  NotificationTemplate,
  NotificationTemplatesResponse,
  UpdateNotificationTemplateInput,
} from "./notification-templates.dto";
export { adminNotificationTemplatesKeys } from "./notification-templates.keys";

export {
  createAdminProgressApi,
  type AdminProgressApi,
} from "./progress.client";
export { adminProgressEndpoints } from "./progress.endpoint";
export type {
  AdminExercisesPage,
  AdminMetricTypesPage,
  CreateExerciseInput,
  CreateMetricTypeInput,
  ListAdminExercisesQuery,
  ListAdminMetricTypesQuery,
  UpdateExerciseInput,
  UpdateMetricTypeInput,
  VerifyExerciseInput,
} from "./progress.dto";
export { adminProgressKeys } from "./progress.keys";

export {
  createAdminCoachingApi,
  type AdminCoachingApi,
} from "./coaching.client";
export { adminCoachingEndpoints } from "./coaching.endpoint";
export type {
  AdminCoachService,
  AdminCoachServicesPage,
  AdminCoachStudentsPage,
  AdminHealthAssessment,
  AdminListCoachingQuery,
  AdminSessionPackagesPage,
} from "./coaching.dto";
export { adminCoachingKeys } from "./coaching.keys";

export {
  createAdminMembershipsApi,
  type AdminMembershipsApi,
} from "./memberships.client";
export { adminMembershipsEndpoints } from "./memberships.endpoint";
export type {
  AdminPlatformPlansPage,
  AdminPlatformSubscriptionsPage,
  CreatePlatformPlanInput,
  ListAdminPlatformPlansQuery,
  ListAdminPlatformSubscriptionsQuery,
  UpdatePlatformPlanInput,
} from "./memberships.dto";
export { adminMembershipsKeys } from "./memberships.keys";

export {
  createAdminSupportApi,
  type AdminSupportApi,
} from "./support.client";
export { adminSupportEndpoints } from "./support.endpoint";
export type {
  AdminFaqItem,
  AdminUpdateTicketInput,
  CreateFaqInput,
  ListAdminFaqQuery,
  ListAdminSupportTicketsQuery,
  UpdateFaqInput,
} from "./support.dto";
export { adminSupportKeys } from "./support.keys";

export {
  createAdminArticlesApi,
  type AdminArticlesApi,
} from "./articles.client";
export { adminArticlesEndpoints } from "./articles.endpoint";
export type {
  AdminArticle,
  CreateArticleInput,
  ListAdminArticlesQuery,
  UpdateArticleInput,
} from "./articles.dto";
export { adminArticlesKeys } from "./articles.keys";

export {
  createAdminGamificationApi,
  type AdminGamificationApi,
} from "./gamification.client";
export { adminGamificationEndpoints } from "./gamification.endpoint";
export type {
  AchievementGrantMode,
  AchievementMetric,
  AdjustPointsInput,
  AdjustPointsResult,
  AdminAchievement,
  AdminAchievementGrant,
  AdminPointRule,
  CreateAchievementInput,
  CreatePointRuleInput,
  GamificationOverview,
  GrantAchievementSubjectInput,
  ListAdminAchievementsQuery,
  ListAdminGrantsQuery,
  ListAdminPointRulesQuery,
  ListAdminPointTransactionsQuery,
  PointRuleEvent,
  PointRuleRepeat,
  UpdateAchievementInput,
  UpdatePointRuleInput,
} from "./gamification.dto";
export { adminGamificationKeys } from "./gamification.keys";

export {
  createAdminBannersApi,
  type AdminBannersApi,
} from "./banners.client";
export { adminBannersEndpoints } from "./banners.endpoint";
export type {
  AdminBanner,
  BannerScheduleInput,
  BannerSlideInput,
  CreateBannerInput,
  ListAdminBannersQuery,
  UpdateBannerInput,
} from "./banners.dto";
export { adminBannersKeys } from "./banners.keys";

export {
  createAdminSocialApi,
  type AdminSocialApi,
} from "./social.client";
export { adminSocialEndpoints } from "./social.endpoint";
export type {
  AdminSocialReportsPage,
  ListAdminSocialReportsQuery,
  ResolveSocialReportInput,
  SocialReport,
  SocialReportStatus,
} from "./social.dto";
export { adminSocialKeys } from "./social.keys";

export {
  createAdminNutritionApi,
  type AdminNutritionApi,
} from "./nutrition.client";
export { adminNutritionEndpoints } from "./nutrition.endpoint";
export type {
  CreateFoodItemInput,
  FoodItem,
  FoodItemsPage,
  FoodItemStatus,
  ListFoodItemsQuery,
  UpdateFoodItemInput,
} from "./nutrition.dto";
export { adminNutritionKeys } from "./nutrition.keys";

export {
  createAdminAuditApi,
  type AdminAuditApi,
} from "./audit.client";
export { adminAuditEndpoints } from "./audit.endpoint";
export type {
  AuditLogItem,
  AuditLogsPage,
  ImpersonationSession,
  ListAuditLogsQuery,
  StartImpersonationInput,
  StartImpersonationResult,
} from "./audit.dto";
export { adminAuditKeys } from "./audit.keys";
