import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AnalyticsOverviewScreen } from "@/modules/analytics/screens/AnalyticsOverviewScreen";
import { OtpScreen } from "@/modules/auth/screens/OtpScreen";
import { ForgotPasswordScreen } from "@/modules/auth/screens/ForgotPasswordScreen";
import { SignInScreen } from "@/modules/auth/screens/SignInScreen";
import { ChoicesCreateScreen } from "@/modules/basics/screens/ChoicesCreateScreen";
import { ChoicesEditScreen } from "@/modules/basics/screens/ChoicesEditScreen";
import { ChoicesListScreen } from "@/modules/basics/screens/ChoicesListScreen";
import { LocationsCreateScreen } from "@/modules/basics/screens/LocationsCreateScreen";
import { LocationsEditScreen } from "@/modules/basics/screens/LocationsEditScreen";
import { LocationsListScreen } from "@/modules/basics/screens/LocationsListScreen";
import { RefsCreateScreen } from "@/modules/basics/screens/RefsCreateScreen";
import { RefsEditScreen } from "@/modules/basics/screens/RefsEditScreen";
import { RefsListScreen } from "@/modules/basics/screens/RefsListScreen";
import { SportsCreateScreen } from "@/modules/basics/screens/SportsCreateScreen";
import { SportsEditScreen } from "@/modules/basics/screens/SportsEditScreen";
import { SportsListScreen } from "@/modules/basics/screens/SportsListScreen";
import { ClubDetailScreen } from "@/modules/clubs/screens/ClubDetailScreen";
import { ClubsCreateScreen } from "@/modules/clubs/screens/ClubsCreateScreen";
import { ClubsEditScreen } from "@/modules/clubs/screens/ClubsEditScreen";
import { ClubSlotsCreateScreen } from "@/modules/clubs/screens/ClubSlotsCreateScreen";
import { ClubSlotsEditScreen } from "@/modules/clubs/screens/ClubSlotsEditScreen";
import { ClubsListScreen } from "@/modules/clubs/screens/ClubsListScreen";
import { DashboardHomeScreen } from "@/modules/dashboard/screens/DashboardHomeScreen";
import { ArticlesCreateScreen } from "@/modules/articles/screens/ArticlesCreateScreen";
import { ArticlesEditScreen } from "@/modules/articles/screens/ArticlesEditScreen";
import { ArticlesListScreen } from "@/modules/articles/screens/ArticlesListScreen";
import { BannersCreateScreen } from "@/modules/banners/screens/BannersCreateScreen";
import { BannersEditScreen } from "@/modules/banners/screens/BannersEditScreen";
import { BannersListScreen } from "@/modules/banners/screens/BannersListScreen";
import { AchievementsCreateScreen } from "@/modules/gamification/screens/AchievementsCreateScreen";
import { AchievementsEditScreen } from "@/modules/gamification/screens/AchievementsEditScreen";
import { AchievementsListScreen } from "@/modules/gamification/screens/AchievementsListScreen";
import { PointRulesCreateScreen } from "@/modules/gamification/screens/PointRulesCreateScreen";
import { PointRulesEditScreen } from "@/modules/gamification/screens/PointRulesEditScreen";
import { PointRulesListScreen } from "@/modules/gamification/screens/PointRulesListScreen";
import { PointsLedgerScreen } from "@/modules/gamification/screens/PointsLedgerScreen";
import { FinanceLedgerScreen } from "@/modules/finance/screens/FinanceLedgerScreen";
import { PaymentsListScreen } from "@/modules/finance/screens/PaymentsListScreen";
import { PayoutsListScreen } from "@/modules/finance/screens/PayoutsListScreen";
import { RefundsListScreen } from "@/modules/finance/screens/RefundsListScreen";
import { BookingsListScreen } from "@/modules/bookings/screens/BookingsListScreen";
import { PlatformPlansCreateScreen } from "@/modules/catalog/screens/PlatformPlansCreateScreen";
import { PlatformPlansEditScreen } from "@/modules/catalog/screens/PlatformPlansEditScreen";
import { PlatformPlansScreen } from "@/modules/catalog/screens/PlatformPlansScreen";
import { FoodItemsCreateScreen } from "@/modules/catalog/screens/FoodItemsCreateScreen";
import { FoodItemsEditScreen } from "@/modules/catalog/screens/FoodItemsEditScreen";
import { FoodItemsScreen } from "@/modules/catalog/screens/FoodItemsScreen";
import { ExercisesCatalogScreen } from "@/modules/catalog/screens/ExercisesCatalogScreen";
import { ExercisesCreateScreen } from "@/modules/catalog/screens/ExercisesCreateScreen";
import { ExercisesEditScreen } from "@/modules/catalog/screens/ExercisesEditScreen";
import { MetricTypesCreateScreen } from "@/modules/catalog/screens/MetricTypesCreateScreen";
import { MetricTypesEditScreen } from "@/modules/catalog/screens/MetricTypesEditScreen";
import { MetricTypesScreen } from "@/modules/catalog/screens/MetricTypesScreen";
import { CoachingListsScreen } from "@/modules/catalog/screens/CoachingListsScreen";
import { SocialReportsScreen } from "@/modules/ops/screens/SocialReportsScreen";
import { AuditLogsScreen } from "@/modules/ops/screens/AuditLogsScreen";
import { NotificationTemplatesEditScreen } from "@/modules/ops/screens/NotificationTemplatesEditScreen";
import { NotificationTemplatesScreen } from "@/modules/ops/screens/NotificationTemplatesScreen";
import { FaqCreateScreen } from "@/modules/support/screens/FaqCreateScreen";
import { FaqEditScreen } from "@/modules/support/screens/FaqEditScreen";
import { FaqListScreen } from "@/modules/support/screens/FaqListScreen";
import { SupportTicketsScreen } from "@/modules/support/screens/SupportTicketsScreen";
import { ClubReviewsScreen } from "@/modules/users/screens/ClubReviewsScreen";
import { CoachVerificationsScreen } from "@/modules/users/screens/CoachVerificationsScreen";
import { KycListScreen } from "@/modules/users/screens/KycListScreen";
import { UserDetailScreen } from "@/modules/users/screens/UserDetailScreen";
import { UsersCreateScreen } from "@/modules/users/screens/UsersCreateScreen";
import { UsersListScreen } from "@/modules/users/screens/UsersListScreen";
import { AdminDocumentMeta } from "@/shared/components";
import {
  isLocationKind,
  isRefType,
  isSportKind,
} from "@/shared/lib/basics-constants";
import { routes } from "@/shared/lib/routes";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import { RedirectIfAuthed, RequireAuth } from "./guards";

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
            <Route element={<AnalyticsOverviewScreen />} path="/analytics" />
            <Route element={<UsersListScreen />} path="/dashboard/users" />
            <Route element={<UsersCreateScreen />} path="/dashboard/users/new" />
            <Route element={<KycListScreen />} path="/dashboard/users/kyc" />
            <Route
              element={<CoachVerificationsScreen />}
              path="/dashboard/users/coach-verifications"
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
            <Route element={<ClubsCreateScreen />} path="/dashboard/clubs/new" />
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
            <Route element={<ChoicesListScreen />} path="/dashboard/choices" />
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
            <Route element={<FaqListScreen />} path="/dashboard/support/faq" />
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
            <Route element={<AuditLogsScreen />} path="/dashboard/ops/audit" />
            <Route
              element={<NotificationTemplatesEditScreen />}
              path="/dashboard/ops/templates/:templateKey/edit"
            />
            <Route
              element={<NotificationTemplatesScreen />}
              path="/dashboard/ops/templates"
            />
          </Route>
          <Route
            element={<Navigate replace to={routes.dashboard} />}
            path="*"
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
