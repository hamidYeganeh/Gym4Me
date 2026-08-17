import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminAnalyticsOverview } from "@repo/api";
import { ApiError } from "@repo/api";
import {
  Building2,
  CalendarCheck,
  CreditCard,
  ExclamationMarkTriangle,
  ShieldCheck,
  UserCheck,
} from "@repo/icons";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { adminAnalytics } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { userDisplayName } from "@/shared/lib/user-format";
import { DashboardHomeHeaderSection } from "../../sections/DashboardHomeHeaderSection";
import { DashboardHomeMetricsSection } from "../../sections/DashboardHomeMetricsSection";
import { DashboardHomePrimaryGridSection } from "../../sections/DashboardHomePrimaryGridSection";
import { DashboardHomeStatsSection } from "../../sections/DashboardHomeStatsSection";
import { dashboardHomeScreenVariants } from "./DashboardHomeScreen.styles";
import type { DashboardHomeScreenProps } from "./DashboardHomeScreen.types";

const faNumber = (value: number) => value.toLocaleString("fa-IR");

export function DashboardHomeScreen({ className }: DashboardHomeScreenProps) {
  const t = useTranslations("Admin");
  const { user } = useAuth();
  const navigate = useNavigate();
  const styles = dashboardHomeScreenVariants();

  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await adminAnalytics.overview());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("Dashboard.errorLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayName = user
    ? userDisplayName(user, t("Dashboard.defaultName"))
    : t("Dashboard.defaultName");

  const totals = overview?.totals;
  const queues = overview?.queues;

  const metrics = useMemo(
    () => [
      {
        icon: <Building2 size={21} />,
        label: t("Dashboard.metrics.activeClubs"),
        value: totals ? faNumber(totals.activeClubs) : "—",
        tone: "accent" as const,
      },
      {
        icon: <UserCheck size={21} />,
        label: t("Dashboard.metrics.pendingKyc"),
        value: queues ? faNumber(queues.pendingKyc) : "—",
        tone: "warning" as const,
      },
      {
        icon: <CalendarCheck size={21} />,
        label: t("Dashboard.metrics.paidBookings"),
        value: totals ? faNumber(totals.bookings30d) : "—",
        tone: "success" as const,
      },
      {
        icon: <CreditCard size={21} />,
        label: t("Dashboard.metrics.gmv"),
        value: totals ? faNumber(totals.gmv30d) : "—",
        tone: "neutral" as const,
      },
    ],
    [queues, t, totals],
  );

  const revenueSeries = (overview?.series.revenueDaily ?? []).slice(-7);
  const chartData = revenueSeries.map((point) => ({
    label: faNumber(Number.parseInt(point.date.slice(8), 10)),
    value: point.value,
  }));
  const revenueTotal = revenueSeries.reduce(
    (sum, point) => sum + point.value,
    0,
  );

  const queueItems = useMemo(
    () => [
      {
        icon: <ShieldCheck size={20} />,
        title: t("Dashboard.queue.kycTitle"),
        description: t("Dashboard.queue.kycDescription"),
        count: queues ? faNumber(queues.pendingKyc) : "—",
        tone: "warning" as const,
      },
      {
        icon: <CreditCard size={20} />,
        title: t("Dashboard.queue.refundTitle"),
        description: t("Dashboard.queue.refundDescription"),
        count: queues ? faNumber(queues.refundRequests) : "—",
        tone: "danger" as const,
      },
      {
        icon: <ExclamationMarkTriangle size={20} />,
        title: t("Dashboard.queue.reportsTitle"),
        description: t("Dashboard.queue.reportsDescription"),
        count: queues ? faNumber(queues.openSocialReports) : "—",
        tone: "neutral" as const,
      },
    ],
    [queues, t],
  );

  const queueTotal = queues
    ? queues.pendingKyc +
      queues.pendingCoachVerifications +
      queues.pendingClubReviews +
      queues.openSupportTickets +
      queues.openSocialReports +
      queues.refundRequests
    : 0;

  const secondaryStats = useMemo(
    () => [
      {
        label: t("Dashboard.stats.users"),
        value: totals ? faNumber(totals.users) : "—",
      },
      {
        label: t("Dashboard.stats.usersNew30d"),
        value: totals ? faNumber(totals.usersNew30d) : "—",
      },
      {
        label: t("Dashboard.stats.verifiedCoaches"),
        value: totals ? faNumber(totals.verifiedCoaches) : "—",
      },
      {
        label: t("Dashboard.stats.activeMemberships"),
        value: totals ? faNumber(totals.activeMemberships) : "—",
      },
      {
        label: t("Dashboard.stats.openTickets"),
        value: queues ? faNumber(queues.openSupportTickets) : "—",
      },
      {
        label: t("Dashboard.stats.pendingCoachVerifications"),
        value: queues ? faNumber(queues.pendingCoachVerifications) : "—",
      },
    ],
    [queues, t, totals],
  );

  return (
    <AdminShell activeNavId="home" className={className}>
      <div className={styles.content()}>
        <DashboardHomeHeaderSection
          displayName={displayName}
          loading={loading}
          onNavigateBookings={() => navigate(routes.bookings)}
          onNavigateFinance={() => navigate(routes.financeLedger)}
          onNavigateUsers={() => navigate(routes.users)}
          onRefresh={() => void load()}
        />

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <DashboardHomeMetricsSection metrics={metrics} />

        <DashboardHomePrimaryGridSection
          chartAriaLabel={t("Dashboard.revenue.chartAriaLabel")}
          chartData={chartData}
          queueActionLabel={t("Dashboard.queue.action")}
          queueDescription={t("Dashboard.queue.description")}
          queueItems={queueItems}
          queueTitle={t("Dashboard.queue.title")}
          queueTotal={faNumber(queueTotal)}
          revenueDescription={t("Dashboard.revenue.description")}
          revenueEmptyLabel={t("Dashboard.revenue.empty")}
          revenueTitle={t("Dashboard.revenue.title")}
          revenueTotal={faNumber(revenueTotal)}
          revenueUnit={t("Dashboard.revenue.unit")}
          onQueueAction={() => navigate(routes.usersKyc)}
        />

        <DashboardHomeStatsSection
          description={t("Dashboard.stats.description")}
          stats={secondaryStats}
          title={t("Dashboard.stats.title")}
        />
      </div>
    </AdminShell>
  );
}
