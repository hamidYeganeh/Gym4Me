import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AnalyticsOverviewScreen } from "@/modules/analytics/screens/AnalyticsOverviewScreen";
import { OtpScreen } from "@/modules/auth/screens/OtpScreen";
import { ForgotPasswordScreen } from "@/modules/auth/screens/ForgotPasswordScreen";
import { SignInScreen } from "@/modules/auth/screens/SignInScreen";
import { ChoicesListScreen } from "@/modules/basics/screens/ChoicesListScreen";
import { LocationsListScreen } from "@/modules/basics/screens/LocationsListScreen";
import { RefsListScreen } from "@/modules/basics/screens/RefsListScreen";
import { SportsListScreen } from "@/modules/basics/screens/SportsListScreen";
import { ClubDetailScreen } from "@/modules/clubs/screens/ClubDetailScreen";
import { ClubsListScreen } from "@/modules/clubs/screens/ClubsListScreen";
import { DashboardHomeScreen } from "@/modules/dashboard/screens/DashboardHomeScreen";
import { ArticlesListScreen } from "@/modules/articles/screens/ArticlesListScreen";
import { BannersListScreen } from "@/modules/banners/screens/BannersListScreen";
import { AchievementsListScreen } from "@/modules/gamification/screens/AchievementsListScreen";
import { PointRulesListScreen } from "@/modules/gamification/screens/PointRulesListScreen";
import { PointsLedgerScreen } from "@/modules/gamification/screens/PointsLedgerScreen";
import { FinanceLedgerScreen } from "@/modules/finance/screens/FinanceLedgerScreen";
import { PaymentsListScreen } from "@/modules/finance/screens/PaymentsListScreen";
import { PayoutsListScreen } from "@/modules/finance/screens/PayoutsListScreen";
import { RefundsListScreen } from "@/modules/finance/screens/RefundsListScreen";
import { BookingsListScreen } from "@/modules/bookings/screens/BookingsListScreen";
import { PlatformPlansScreen } from "@/modules/catalog/screens/PlatformPlansScreen";
import { FoodItemsScreen } from "@/modules/catalog/screens/FoodItemsScreen";
import { ExercisesCatalogScreen } from "@/modules/catalog/screens/ExercisesCatalogScreen";
import { MetricTypesScreen } from "@/modules/catalog/screens/MetricTypesScreen";
import { CoachingListsScreen } from "@/modules/catalog/screens/CoachingListsScreen";
import { SocialReportsScreen } from "@/modules/ops/screens/SocialReportsScreen";
import { AuditLogsScreen } from "@/modules/ops/screens/AuditLogsScreen";
import { NotificationTemplatesScreen } from "@/modules/ops/screens/NotificationTemplatesScreen";
import { FaqListScreen } from "@/modules/support/screens/FaqListScreen";
import { SupportTicketsScreen } from "@/modules/support/screens/SupportTicketsScreen";
import { ClubReviewsScreen } from "@/modules/users/screens/ClubReviewsScreen";
import { CoachVerificationsScreen } from "@/modules/users/screens/CoachVerificationsScreen";
import { KycListScreen } from "@/modules/users/screens/KycListScreen";
import { UserDetailScreen } from "@/modules/users/screens/UserDetailScreen";
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
            <Route
              element={<ClubDetailScreen />}
              path="/dashboard/clubs/:clubId"
            />
            <Route
              element={<Navigate replace to={routes.locations()} />}
              path="/dashboard/locations"
            />
            <Route
              element={<LocationsRoute />}
              path="/dashboard/locations/:kind"
            />
            <Route
              element={<Navigate replace to={routes.sports()} />}
              path="/dashboard/sports"
            />
            <Route element={<SportsRoute />} path="/dashboard/sports/:kind" />
            <Route element={<ChoicesListScreen />} path="/dashboard/choices" />
            <Route
              element={<Navigate replace to={routes.refs()} />}
              path="/dashboard/refs"
            />
            <Route element={<RefsRoute />} path="/dashboard/refs/:type" />
            <Route
              element={<SupportTicketsScreen />}
              path="/dashboard/support"
            />
            <Route element={<FaqListScreen />} path="/dashboard/support/faq" />
            <Route
              element={<ArticlesListScreen />}
              path="/dashboard/articles"
            />
            <Route
              element={<BannersListScreen />}
              path="/dashboard/banners"
            />
            <Route
              element={<AchievementsListScreen />}
              path="/dashboard/gamification"
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
              element={<PlatformPlansScreen />}
              path="/dashboard/catalog/plans"
            />
            <Route
              element={<FoodItemsScreen />}
              path="/dashboard/catalog/food"
            />
            <Route
              element={<ExercisesCatalogScreen />}
              path="/dashboard/catalog/exercises"
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
