import { Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { AdminDocumentMeta } from "@/shared/components/AdminDocumentMeta";
import { RouteFallback } from "@/shared/components/RouteFallback";
import {
  isLocationKind,
  isRefType,
  isSportKind,
} from "@/shared/lib/basics-constants";
import { routes } from "@/shared/lib/routes";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import { RedirectIfAuthed, RequireAuth } from "./guards";
import {
  AchievementsCreateScreen,
  AchievementsEditScreen,
  AchievementsListScreen,
  AdminProfileScreen,
  AdminRecordDetailScreen,
  AnalyticsOverviewScreen,
  ArticlesCreateScreen,
  ArticlesEditScreen,
  ArticlesListScreen,
  AuditLogsScreen,
  BannersCreateScreen,
  BannersEditScreen,
  BannersListScreen,
  BookingsListScreen,
  ChoicesCreateScreen,
  ChoicesEditScreen,
  ChoicesListScreen,
  ClubDetailScreen,
  ClubReviewsScreen,
  ClubsCreateScreen,
  ClubsEditScreen,
  ClubsListScreen,
  ClubSlotsCreateScreen,
  ClubSlotsEditScreen,
  CoachingListsScreen,
  CoachVerificationsScreen,
  RoleRequestsScreen,
  DashboardHomeScreen,
  DiscoveryComposerScreen,
  ExercisesCatalogScreen,
  ExercisesCreateScreen,
  ExercisesEditScreen,
  FaqCreateScreen,
  FaqEditScreen,
  FaqListScreen,
  FeatureFlagsScreen,
  FinanceLedgerScreen,
  FoodItemsCreateScreen,
  FoodItemsEditScreen,
  FoodItemsScreen,
  ForgotPasswordScreen,
  KycListScreen,
  LocationsCreateScreen,
  LocationsEditScreen,
  LocationsListScreen,
  MetricTypesCreateScreen,
  MetricTypesEditScreen,
  MetricTypesScreen,
  NotificationTemplatesEditScreen,
  NotificationTemplatesScreen,
  OtpScreen,
  PaymentsListScreen,
  PayoutsListScreen,
  PlatformPlansCreateScreen,
  PlatformPlansEditScreen,
  PlatformPlansScreen,
  PointRulesCreateScreen,
  PointRulesEditScreen,
  PointRulesListScreen,
  PointsLedgerScreen,
  RefsCreateScreen,
  RefsEditScreen,
  RefsListScreen,
  RefundsListScreen,
  ReleasePoliciesScreen,
  SignInScreen,
  SocialReportsScreen,
  SportsCreateScreen,
  SportsEditScreen,
  SportsListScreen,
  SupportTicketsScreen,
  UserDetailScreen,
  UsersCreateScreen,
  UsersListScreen,
} from "./lazy-screens";

function LocationsRoute() {
  const { kind = "country" } = useParams();
  if (!isLocationKind(kind)) {
    return <Navigate replace to={routes.locations()} />;
  }
  return <LocationsListScreen kind={kind} />;
}

function SportsRoute() {
  const { kind = "category" } = useParams();
  if (!isSportKind(kind)) {
    return <Navigate replace to={routes.sports()} />;
  }
  return <SportsListScreen kind={kind} />;
}

function RefsRoute() {
  const { type = "equipment" } = useParams();
  if (!isRefType(type)) {
    return <Navigate replace to={routes.refs()} />;
  }
  return <RefsListScreen type={type} />;
}

export function AppRouter() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <AdminDocumentMeta />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              element={
                <RedirectIfAuthed>
                  <SignInScreen />
                </RedirectIfAuthed>
              }
              path={routes.signIn}
            />
            <Route
              element={
                <RedirectIfAuthed>
                  <OtpScreen />
                </RedirectIfAuthed>
              }
              path={routes.otp}
            />
            <Route
              element={
                <RedirectIfAuthed>
                  <ForgotPasswordScreen />
                </RedirectIfAuthed>
              }
              path={routes.forgotPassword}
            />
            <Route element={<RequireAuth />}>
              <Route
                element={<Navigate replace to={routes.dashboard} />}
                path="/"
              />
              <Route element={<DashboardHomeScreen />} path="/dashboard" />
              <Route
                element={<AdminRecordDetailScreen />}
                path="/dashboard/records/:recordId"
              />
              <Route
                element={<AdminProfileScreen />}
                path="/dashboard/profile"
              />
              <Route element={<AnalyticsOverviewScreen />} path="/analytics" />
              <Route element={<UsersListScreen />} path="/dashboard/users" />
              <Route
                element={<UsersCreateScreen />}
                path="/dashboard/users/new"
              />
              <Route element={<KycListScreen />} path="/dashboard/users/kyc" />
              <Route
                element={<CoachVerificationsScreen />}
                path="/dashboard/users/coach-verifications"
              />
              <Route
                element={<RoleRequestsScreen />}
                path="/dashboard/users/role-requests"
              />
              <Route
                element={<ClubReviewsScreen />}
                path="/dashboard/users/club-reviews"
              />
              <Route
                element={<UserDetailScreen />}
                path="/dashboard/users/:userId"
              />
              <Route element={<ClubsListScreen />} path="/dashboard/clubs" />
              <Route
                element={<ClubsCreateScreen />}
                path="/dashboard/clubs/new"
              />
              <Route
                element={<ClubSlotsCreateScreen />}
                path="/dashboard/clubs/:clubId/slots/new"
              />
              <Route
                element={<ClubSlotsEditScreen />}
                path="/dashboard/clubs/:clubId/slots/:slotId/edit"
              />
              <Route
                element={<ClubsEditScreen />}
                path="/dashboard/clubs/:clubId/edit"
              />
              <Route
                element={<ClubDetailScreen />}
                path="/dashboard/clubs/:clubId"
              />
              <Route
                element={<Navigate replace to={routes.locations()} />}
                path="/dashboard/locations"
              />
              <Route
                element={<LocationsCreateScreen />}
                path="/dashboard/locations/:kind/new"
              />
              <Route
                element={<LocationsEditScreen />}
                path="/dashboard/locations/:kind/:locationId/edit"
              />
              <Route
                element={<LocationsRoute />}
                path="/dashboard/locations/:kind"
              />
              <Route
                element={<Navigate replace to={routes.sports()} />}
                path="/dashboard/sports"
              />
              <Route
                element={<SportsCreateScreen />}
                path="/dashboard/sports/:kind/new"
              />
              <Route
                element={<SportsEditScreen />}
                path="/dashboard/sports/:kind/:sportId/edit"
              />
              <Route element={<SportsRoute />} path="/dashboard/sports/:kind" />
              <Route
                element={<ChoicesListScreen />}
                path="/dashboard/choices"
              />
              <Route
                element={<ChoicesCreateScreen />}
                path="/dashboard/choices/new"
              />
              <Route
                element={<ChoicesEditScreen />}
                path="/dashboard/choices/:choiceKey/edit"
              />
              <Route
                element={<Navigate replace to={routes.refs()} />}
                path="/dashboard/refs"
              />
              <Route
                element={<RefsCreateScreen />}
                path="/dashboard/refs/:type/new"
              />
              <Route
                element={<RefsEditScreen />}
                path="/dashboard/refs/:type/:refId/edit"
              />
              <Route element={<RefsRoute />} path="/dashboard/refs/:type" />
              <Route
                element={<SupportTicketsScreen />}
                path="/dashboard/support"
              />
              <Route
                element={<FaqCreateScreen />}
                path="/dashboard/support/faq/new"
              />
              <Route
                element={<FaqEditScreen />}
                path="/dashboard/support/faq/:faqId/edit"
              />
              <Route
                element={<FaqListScreen />}
                path="/dashboard/support/faq"
              />
              <Route
                element={<ArticlesCreateScreen />}
                path="/dashboard/articles/new"
              />
              <Route
                element={<ArticlesEditScreen />}
                path="/dashboard/articles/:articleId/edit"
              />
              <Route
                element={<ArticlesListScreen />}
                path="/dashboard/articles"
              />
              <Route
                element={<BannersCreateScreen />}
                path="/dashboard/banners/new"
              />
              <Route
                element={<BannersEditScreen />}
                path="/dashboard/banners/:bannerId/edit"
              />
              <Route
                element={<BannersListScreen />}
                path="/dashboard/banners"
              />
              <Route
                element={<AchievementsCreateScreen />}
                path="/dashboard/gamification/new"
              />
              <Route
                element={<AchievementsEditScreen />}
                path="/dashboard/gamification/:achievementId/edit"
              />
              <Route
                element={<AchievementsListScreen />}
                path="/dashboard/gamification"
              />
              <Route
                element={<PointRulesCreateScreen />}
                path="/dashboard/gamification/rules/new"
              />
              <Route
                element={<PointRulesEditScreen />}
                path="/dashboard/gamification/rules/:ruleId/edit"
              />
              <Route
                element={<PointRulesListScreen />}
                path="/dashboard/gamification/rules"
              />
              <Route
                element={<PointsLedgerScreen />}
                path="/dashboard/gamification/ledger"
              />
              <Route
                element={<FinanceLedgerScreen />}
                path="/dashboard/finance/ledger"
              />
              <Route
                element={<PaymentsListScreen />}
                path="/dashboard/finance/payments"
              />
              <Route
                element={<PayoutsListScreen />}
                path="/dashboard/finance/payouts"
              />
              <Route
                element={<RefundsListScreen />}
                path="/dashboard/finance/refunds"
              />
              <Route
                element={<BookingsListScreen />}
                path="/dashboard/bookings"
              />
              <Route
                element={<PlatformPlansCreateScreen />}
                path="/dashboard/catalog/plans/new"
              />
              <Route
                element={<PlatformPlansEditScreen />}
                path="/dashboard/catalog/plans/:planId/edit"
              />
              <Route
                element={<PlatformPlansScreen />}
                path="/dashboard/catalog/plans"
              />
              <Route
                element={<FoodItemsCreateScreen />}
                path="/dashboard/catalog/food/new"
              />
              <Route
                element={<FoodItemsEditScreen />}
                path="/dashboard/catalog/food/:foodId/edit"
              />
              <Route
                element={<FoodItemsScreen />}
                path="/dashboard/catalog/food"
              />
              <Route
                element={<ExercisesCreateScreen />}
                path="/dashboard/catalog/exercises/new"
              />
              <Route
                element={<ExercisesEditScreen />}
                path="/dashboard/catalog/exercises/:exerciseId/edit"
              />
              <Route
                element={<ExercisesCatalogScreen />}
                path="/dashboard/catalog/exercises"
              />
              <Route
                element={<MetricTypesCreateScreen />}
                path="/dashboard/catalog/metrics/new"
              />
              <Route
                element={<MetricTypesEditScreen />}
                path="/dashboard/catalog/metrics/:metricId/edit"
              />
              <Route
                element={<MetricTypesScreen />}
                path="/dashboard/catalog/metrics"
              />
              <Route
                element={<CoachingListsScreen />}
                path="/dashboard/catalog/coaching"
              />
              <Route
                element={<SocialReportsScreen />}
                path="/dashboard/ops/social"
              />
              <Route
                element={<AuditLogsScreen />}
                path="/dashboard/ops/audit"
              />
              <Route
                element={<NotificationTemplatesEditScreen />}
                path="/dashboard/ops/templates/:templateKey/edit"
              />
              <Route
                element={<NotificationTemplatesScreen />}
                path="/dashboard/ops/templates"
              />
              <Route
                element={<FeatureFlagsScreen />}
                path="/dashboard/ops/flags"
              />
              <Route
                element={<DiscoveryComposerScreen />}
                path="/dashboard/ops/discovery"
              />
              <Route
                element={<ReleasePoliciesScreen />}
                path="/dashboard/ops/releases"
              />
            </Route>
            <Route
              element={<Navigate replace to={routes.dashboard} />}
              path="*"
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
