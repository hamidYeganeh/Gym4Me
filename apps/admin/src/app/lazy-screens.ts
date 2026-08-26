import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type AnyProps = Record<string, unknown>;

function lazyNamed(
  loader: () => Promise<object>,
  exportName: string,
): LazyExoticComponent<ComponentType<AnyProps>> {
  return lazy(async () => {
    const mod = (await loader()) as Record<string, ComponentType<AnyProps>>;
    const Component = mod[exportName];
    if (!Component) {
      throw new Error(`Missing export "${exportName}"`);
    }
    return { default: Component };
  });
}

export const SignInScreen = lazyNamed(
  () => import("@/modules/auth/screens/SignInScreen"),
  "SignInScreen",
);
export const OtpScreen = lazyNamed(
  () => import("@/modules/auth/screens/OtpScreen"),
  "OtpScreen",
);
export const ForgotPasswordScreen = lazyNamed(
  () => import("@/modules/auth/screens/ForgotPasswordScreen"),
  "ForgotPasswordScreen",
);
export const DashboardHomeScreen = lazyNamed(
  () => import("@/modules/dashboard/screens/DashboardHomeScreen"),
  "DashboardHomeScreen",
);
export const AdminRecordDetailScreen = lazyNamed(
  () => import("@/modules/dashboard/screens/AdminRecordDetailScreen"),
  "AdminRecordDetailScreen",
);
export const AdminProfileScreen = lazyNamed(
  () => import("@/modules/account/screens/AdminProfileScreen"),
  "AdminProfileScreen",
);
export const AnalyticsOverviewScreen = lazyNamed(
  () => import("@/modules/analytics/screens/AnalyticsOverviewScreen"),
  "AnalyticsOverviewScreen",
);
export const UsersListScreen = lazyNamed(
  () => import("@/modules/users/screens/UsersListScreen"),
  "UsersListScreen",
);
export const UsersCreateScreen = lazyNamed(
  () => import("@/modules/users/screens/UsersCreateScreen"),
  "UsersCreateScreen",
);
export const KycListScreen = lazyNamed(
  () => import("@/modules/users/screens/KycListScreen"),
  "KycListScreen",
);
export const CoachVerificationsScreen = lazyNamed(
  () => import("@/modules/users/screens/CoachVerificationsScreen"),
  "CoachVerificationsScreen",
);
export const RoleRequestsScreen = lazyNamed(
  () => import("@/modules/users/screens/RoleRequestsScreen"),
  "RoleRequestsScreen",
);
export const ClubReviewsScreen = lazyNamed(
  () => import("@/modules/users/screens/ClubReviewsScreen"),
  "ClubReviewsScreen",
);
export const UserDetailScreen = lazyNamed(
  () => import("@/modules/users/screens/UserDetailScreen"),
  "UserDetailScreen",
);
export const ClubsListScreen = lazyNamed(
  () => import("@/modules/clubs/screens/ClubsListScreen"),
  "ClubsListScreen",
);
export const ClubsCreateScreen = lazyNamed(
  () => import("@/modules/clubs/screens/ClubsCreateScreen"),
  "ClubsCreateScreen",
);
export const ClubSlotsCreateScreen = lazyNamed(
  () => import("@/modules/clubs/screens/ClubSlotsCreateScreen"),
  "ClubSlotsCreateScreen",
);
export const ClubSlotsEditScreen = lazyNamed(
  () => import("@/modules/clubs/screens/ClubSlotsEditScreen"),
  "ClubSlotsEditScreen",
);
export const ClubsEditScreen = lazyNamed(
  () => import("@/modules/clubs/screens/ClubsEditScreen"),
  "ClubsEditScreen",
);
export const ClubDetailScreen = lazyNamed(
  () => import("@/modules/clubs/screens/ClubDetailScreen"),
  "ClubDetailScreen",
);
export const LocationsListScreen = lazyNamed(
  () => import("@/modules/basics/screens/LocationsListScreen"),
  "LocationsListScreen",
);
export const LocationsCreateScreen = lazyNamed(
  () => import("@/modules/basics/screens/LocationsCreateScreen"),
  "LocationsCreateScreen",
);
export const LocationsEditScreen = lazyNamed(
  () => import("@/modules/basics/screens/LocationsEditScreen"),
  "LocationsEditScreen",
);
export const SportsListScreen = lazyNamed(
  () => import("@/modules/basics/screens/SportsListScreen"),
  "SportsListScreen",
);
export const SportsCreateScreen = lazyNamed(
  () => import("@/modules/basics/screens/SportsCreateScreen"),
  "SportsCreateScreen",
);
export const SportsEditScreen = lazyNamed(
  () => import("@/modules/basics/screens/SportsEditScreen"),
  "SportsEditScreen",
);
export const ChoicesListScreen = lazyNamed(
  () => import("@/modules/basics/screens/ChoicesListScreen"),
  "ChoicesListScreen",
);
export const ChoicesCreateScreen = lazyNamed(
  () => import("@/modules/basics/screens/ChoicesCreateScreen"),
  "ChoicesCreateScreen",
);
export const ChoicesEditScreen = lazyNamed(
  () => import("@/modules/basics/screens/ChoicesEditScreen"),
  "ChoicesEditScreen",
);
export const RefsListScreen = lazyNamed(
  () => import("@/modules/basics/screens/RefsListScreen"),
  "RefsListScreen",
);
export const RefsCreateScreen = lazyNamed(
  () => import("@/modules/basics/screens/RefsCreateScreen"),
  "RefsCreateScreen",
);
export const RefsEditScreen = lazyNamed(
  () => import("@/modules/basics/screens/RefsEditScreen"),
  "RefsEditScreen",
);
export const SupportTicketsScreen = lazyNamed(
  () => import("@/modules/support/screens/SupportTicketsScreen"),
  "SupportTicketsScreen",
);
export const FaqCreateScreen = lazyNamed(
  () => import("@/modules/support/screens/FaqCreateScreen"),
  "FaqCreateScreen",
);
export const FaqEditScreen = lazyNamed(
  () => import("@/modules/support/screens/FaqEditScreen"),
  "FaqEditScreen",
);
export const FaqListScreen = lazyNamed(
  () => import("@/modules/support/screens/FaqListScreen"),
  "FaqListScreen",
);
export const ArticlesCreateScreen = lazyNamed(
  () => import("@/modules/articles/screens/ArticlesCreateScreen"),
  "ArticlesCreateScreen",
);
export const ArticlesEditScreen = lazyNamed(
  () => import("@/modules/articles/screens/ArticlesEditScreen"),
  "ArticlesEditScreen",
);
export const ArticlesListScreen = lazyNamed(
  () => import("@/modules/articles/screens/ArticlesListScreen"),
  "ArticlesListScreen",
);
export const BannersCreateScreen = lazyNamed(
  () => import("@/modules/banners/screens/BannersCreateScreen"),
  "BannersCreateScreen",
);
export const BannersEditScreen = lazyNamed(
  () => import("@/modules/banners/screens/BannersEditScreen"),
  "BannersEditScreen",
);
export const BannersListScreen = lazyNamed(
  () => import("@/modules/banners/screens/BannersListScreen"),
  "BannersListScreen",
);
export const DiscoveryComposerScreen = lazyNamed(
  () => import("@/modules/discovery/screens/DiscoveryComposerScreen"),
  "DiscoveryComposerScreen",
);
export const AchievementsCreateScreen = lazyNamed(
  () => import("@/modules/gamification/screens/AchievementsCreateScreen"),
  "AchievementsCreateScreen",
);
export const AchievementsEditScreen = lazyNamed(
  () => import("@/modules/gamification/screens/AchievementsEditScreen"),
  "AchievementsEditScreen",
);
export const AchievementsListScreen = lazyNamed(
  () => import("@/modules/gamification/screens/AchievementsListScreen"),
  "AchievementsListScreen",
);
export const PointRulesCreateScreen = lazyNamed(
  () => import("@/modules/gamification/screens/PointRulesCreateScreen"),
  "PointRulesCreateScreen",
);
export const PointRulesEditScreen = lazyNamed(
  () => import("@/modules/gamification/screens/PointRulesEditScreen"),
  "PointRulesEditScreen",
);
export const PointRulesListScreen = lazyNamed(
  () => import("@/modules/gamification/screens/PointRulesListScreen"),
  "PointRulesListScreen",
);
export const PointsLedgerScreen = lazyNamed(
  () => import("@/modules/gamification/screens/PointsLedgerScreen"),
  "PointsLedgerScreen",
);
export const FinanceLedgerScreen = lazyNamed(
  () => import("@/modules/finance/screens/FinanceLedgerScreen"),
  "FinanceLedgerScreen",
);
export const PaymentsListScreen = lazyNamed(
  () => import("@/modules/finance/screens/PaymentsListScreen"),
  "PaymentsListScreen",
);
export const PayoutsListScreen = lazyNamed(
  () => import("@/modules/finance/screens/PayoutsListScreen"),
  "PayoutsListScreen",
);
export const RefundsListScreen = lazyNamed(
  () => import("@/modules/finance/screens/RefundsListScreen"),
  "RefundsListScreen",
);
export const WalletsScreen = lazyNamed(
  () => import("@/modules/finance/screens/WalletsScreen"),
  "WalletsScreen",
);
export const BookingsListScreen = lazyNamed(
  () => import("@/modules/bookings/screens/BookingsListScreen"),
  "BookingsListScreen",
);
export const PlatformPlansCreateScreen = lazyNamed(
  () => import("@/modules/catalog/screens/PlatformPlansCreateScreen"),
  "PlatformPlansCreateScreen",
);
export const PlatformPlansEditScreen = lazyNamed(
  () => import("@/modules/catalog/screens/PlatformPlansEditScreen"),
  "PlatformPlansEditScreen",
);
export const PlatformPlansScreen = lazyNamed(
  () => import("@/modules/catalog/screens/PlatformPlansScreen"),
  "PlatformPlansScreen",
);
export const FoodItemsCreateScreen = lazyNamed(
  () => import("@/modules/catalog/screens/FoodItemsCreateScreen"),
  "FoodItemsCreateScreen",
);
export const FoodItemsEditScreen = lazyNamed(
  () => import("@/modules/catalog/screens/FoodItemsEditScreen"),
  "FoodItemsEditScreen",
);
export const FoodItemsScreen = lazyNamed(
  () => import("@/modules/catalog/screens/FoodItemsScreen"),
  "FoodItemsScreen",
);
export const ExercisesCreateScreen = lazyNamed(
  () => import("@/modules/catalog/screens/ExercisesCreateScreen"),
  "ExercisesCreateScreen",
);
export const ExercisesEditScreen = lazyNamed(
  () => import("@/modules/catalog/screens/ExercisesEditScreen"),
  "ExercisesEditScreen",
);
export const ExercisesCatalogScreen = lazyNamed(
  () => import("@/modules/catalog/screens/ExercisesCatalogScreen"),
  "ExercisesCatalogScreen",
);
export const MetricTypesCreateScreen = lazyNamed(
  () => import("@/modules/catalog/screens/MetricTypesCreateScreen"),
  "MetricTypesCreateScreen",
);
export const MetricTypesEditScreen = lazyNamed(
  () => import("@/modules/catalog/screens/MetricTypesEditScreen"),
  "MetricTypesEditScreen",
);
export const MetricTypesScreen = lazyNamed(
  () => import("@/modules/catalog/screens/MetricTypesScreen"),
  "MetricTypesScreen",
);
export const CoachingListsScreen = lazyNamed(
  () => import("@/modules/catalog/screens/CoachingListsScreen"),
  "CoachingListsScreen",
);
export const SocialReportsScreen = lazyNamed(
  () => import("@/modules/ops/screens/SocialReportsScreen"),
  "SocialReportsScreen",
);
export const AuditLogsScreen = lazyNamed(
  () => import("@/modules/ops/screens/AuditLogsScreen"),
  "AuditLogsScreen",
);
export const AccountDeletionRequestsScreen = lazyNamed(
  () => import('@/modules/ops/screens/AccountDeletionRequestsScreen'),
  'AccountDeletionRequestsScreen',
);
export const NotificationTemplatesEditScreen = lazyNamed(
  () => import("@/modules/ops/screens/NotificationTemplatesEditScreen"),
  "NotificationTemplatesEditScreen",
);
export const NotificationTemplatesScreen = lazyNamed(
  () => import("@/modules/ops/screens/NotificationTemplatesScreen"),
  "NotificationTemplatesScreen",
);
export const FeatureFlagsScreen = lazyNamed(
  () => import("@/modules/app-config/screens/FeatureFlagsScreen"),
  "FeatureFlagsScreen",
);
export const ReleasePoliciesScreen = lazyNamed(
  () => import("@/modules/app-config/screens/ReleasePoliciesScreen"),
  "ReleasePoliciesScreen",
);
