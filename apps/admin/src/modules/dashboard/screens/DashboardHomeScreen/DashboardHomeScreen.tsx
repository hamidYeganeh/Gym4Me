import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Spinner, Typography } from "@heroui/react";
import type { AdminAnalyticsOverview } from "@repo/api";
import { ApiError } from "@repo/api";
import {
  ArrowForward2,
  ArrowRotateClockwise1,
  Building2,
  CalendarCheck,
  CreditCard,
  ExclamationMarkTriangle,
  ShieldCheck,
  UserCheck,
  UsersThree,
} from "@repo/icons";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { adminAnalytics } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { userDisplayName } from "@/shared/lib/user-format";
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

  const metrics = [
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
  ];

  const revenueSeries = (overview?.series.revenueDaily ?? []).slice(-7);
  const chartData = revenueSeries.map((point) => ({
    label: faNumber(Number.parseInt(point.date.slice(8), 10)),
    value: point.value,
  }));

  const revenueTotal = revenueSeries.reduce(
    (sum, point) => sum + point.value,
    0,
  );

  const reviewQueue = [
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
  ];

  const queueTotal = queues
    ? queues.pendingKyc +
      queues.pendingCoachVerifications +
      queues.pendingClubReviews +
      queues.openSupportTickets +
      queues.openSocialReports +
      queues.refundRequests
    : 0;

  const secondaryStats = [
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
  ];

  return (
    <AdminShell activeNavId="home" className={className}>
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <div className={styles.introCopy()}>
            <Typography className={styles.title()} type="h1" weight="bold">
              {t("Dashboard.title", { name: displayName })}
            </Typography>
            <Typography className={styles.subtitle()}>
              {t("Dashboard.subtitle")}
            </Typography>
          </div>

          <div className={styles.introActions()}>
            {loading ? <Spinner size="sm" /> : null}
            <Button
              variant="outline"
              onPress={() => navigate(routes.users)}
            >
              <UsersThree size={18} />
              {t("nav.users")}
            </Button>
            <Button
              variant="outline"
              onPress={() => navigate(routes.financeLedger)}
            >
              <CreditCard size={18} />
              {t("nav.finance")}
            </Button>
            <Button
              variant="outline"
              onPress={() => navigate(routes.bookings)}
            >
              <CalendarCheck size={18} />
              {t("nav.bookings")}
            </Button>
            <Button variant="outline" onPress={() => void load()}>
              <ArrowRotateClockwise1 size={18} />
              {t("Dashboard.refresh")}
            </Button>
          </div>
        </section>

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <Card className={styles.metricsRail()}>
          <Card.Content className={styles.metricsContent()}>
            {metrics.map((metric) => (
              <article className={styles.metric()} key={metric.label}>
                <div className={styles.metricTop()}>
                  <span className={styles.metricIcon({ tone: metric.tone })}>
                    {metric.icon}
                  </span>
                </div>
                <Typography className={styles.metricValue()} type="h2">
                  {metric.value}
                </Typography>
                <Typography className={styles.metricLabel()}>
                  {metric.label}
                </Typography>
              </article>
            ))}
          </Card.Content>
        </Card>

        <div className={styles.primaryGrid()}>
          <Card className={styles.revenueCard()}>
            <Card.Header className={styles.cardHeader()}>
              <div>
                <Card.Title className={styles.cardTitle()}>
                  {t("Dashboard.revenue.title")}
                </Card.Title>
                <Card.Description className={styles.cardDescription()}>
                  {t("Dashboard.revenue.description")}
                </Card.Description>
              </div>
              <div className={styles.revenueTotal()}>
                <span className={styles.revenueValue()}>
                  {faNumber(revenueTotal)}
                </span>
                <span className={styles.revenueUnit()}>
                  {t("Dashboard.revenue.unit")}
                </span>
              </div>
            </Card.Header>
            <Card.Content className={styles.chartContent()}>
              {chartData.length > 0 ? (
                <AreaLineChart
                  aria-label={t("Dashboard.revenue.chartAriaLabel")}
                  className={styles.chart()}
                  color="var(--accent)"
                  data={chartData}
                />
              ) : (
                <Typography className={styles.cardDescription()}>
                  {t("Dashboard.revenue.empty")}
                </Typography>
              )}
            </Card.Content>
          </Card>

          <Card className={styles.queueCard()}>
            <Card.Header className={styles.cardHeader()}>
              <div>
                <Card.Title className={styles.cardTitle()}>
                  {t("Dashboard.queue.title")}
                </Card.Title>
                <Card.Description className={styles.cardDescription()}>
                  {t("Dashboard.queue.description")}
                </Card.Description>
              </div>
              <span className={styles.queueTotal()}>
                {faNumber(queueTotal)}
              </span>
            </Card.Header>
            <Card.Content className={styles.queueContent()}>
              {reviewQueue.map((item) => (
                <div className={styles.queueItem()} key={item.title}>
                  <span className={styles.queueIcon({ tone: item.tone })}>
                    {item.icon}
                  </span>
                  <div className={styles.queueCopy()}>
                    <span className={styles.queueTitle()}>{item.title}</span>
                    <span className={styles.queueDescription()}>
                      {item.description}
                    </span>
                  </div>
                  <span className={styles.queueCount()}>{item.count}</span>
                </div>
              ))}
            </Card.Content>
            <Card.Footer className={styles.cardFooter()}>
              <Button
                fullWidth
                variant="secondary"
                onPress={() => navigate(routes.usersKyc)}
              >
                {t("Dashboard.queue.action")}
                <ArrowForward2 size={17} />
              </Button>
            </Card.Footer>
          </Card>
        </div>

        <Card className={styles.activityCard()}>
          <Card.Header className={styles.cardHeader()}>
            <div>
              <Card.Title className={styles.cardTitle()}>
                {t("Dashboard.stats.title")}
              </Card.Title>
              <Card.Description className={styles.cardDescription()}>
                {t("Dashboard.stats.description")}
              </Card.Description>
            </div>
          </Card.Header>
          <Card.Content className={styles.metricsContent()}>
            {secondaryStats.map((stat) => (
              <article className={styles.metric()} key={stat.label}>
                <Typography className={styles.metricValue()} type="h3">
                  {stat.value}
                </Typography>
                <Typography className={styles.metricLabel()}>
                  {stat.label}
                </Typography>
              </article>
            ))}
          </Card.Content>
        </Card>
      </div>
    </AdminShell>
  );
}
