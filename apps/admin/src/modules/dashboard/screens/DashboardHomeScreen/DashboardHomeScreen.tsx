import { useNavigate } from "react-router-dom";
import { Button, Card, Typography } from "@heroui/react";
import {
  ArrowForward2,
  ArrowRotateClockwise1,
  ArrowTrendDown,
  ArrowTrendUp,
  Building2,
  CalendarCheck,
  CheckCircle,
  CreditCard,
  ExclamationMarkTriangle,
  ShieldCheck,
  UserCheck,
  UsersThree,
} from "@repo/icons";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAuth } from "@/shared/providers/AuthProvider";
import { userDisplayName } from "@/shared/lib/user-format";
import { dashboardHomeScreenVariants } from "./DashboardHomeScreen.styles";
import type { DashboardHomeScreenProps } from "./DashboardHomeScreen.types";

export function DashboardHomeScreen({ className }: DashboardHomeScreenProps) {
  const t = useTranslations("Admin");
  const { user } = useAuth();
  const navigate = useNavigate();
  const styles = dashboardHomeScreenVariants();

  const displayName = user
    ? userDisplayName(user, t("Dashboard.defaultName"))
    : t("Dashboard.defaultName");

  const metrics = [
    {
      icon: <Building2 size={21} />,
      label: t("Dashboard.metrics.activeClubs"),
      value: "۳۲۸",
      trend: "۱۲٪",
      direction: "up" as const,
      tone: "accent" as const,
    },
    {
      icon: <UserCheck size={21} />,
      label: t("Dashboard.metrics.pendingKyc"),
      value: "۱۸",
      trend: "۴",
      direction: "down" as const,
      tone: "warning" as const,
    },
    {
      icon: <CalendarCheck size={21} />,
      label: t("Dashboard.metrics.paidBookings"),
      value: "۱٬۲۸۴",
      trend: "۸٪",
      direction: "up" as const,
      tone: "success" as const,
    },
    {
      icon: <CreditCard size={21} />,
      label: t("Dashboard.metrics.gmv"),
      value: "۸٫۴ میلیارد",
      trend: "۱۶٪",
      direction: "up" as const,
      tone: "neutral" as const,
    },
  ];

  const chartData = [
    { day: t("Dashboard.days.saturday"), value: 48 },
    { day: t("Dashboard.days.sunday"), value: 66 },
    { day: t("Dashboard.days.monday"), value: 56 },
    { day: t("Dashboard.days.tuesday"), value: 82 },
    { day: t("Dashboard.days.wednesday"), value: 72 },
    { day: t("Dashboard.days.thursday"), value: 92 },
    { day: t("Dashboard.days.friday"), value: 64 },
  ];

  const reviewQueue = [
    {
      icon: <ShieldCheck size={20} />,
      title: t("Dashboard.queue.kycTitle"),
      description: t("Dashboard.queue.kycDescription"),
      count: "۱۸",
      tone: "warning" as const,
    },
    {
      icon: <CreditCard size={20} />,
      title: t("Dashboard.queue.refundTitle"),
      description: t("Dashboard.queue.refundDescription"),
      count: "۷",
      tone: "danger" as const,
    },
    {
      icon: <ExclamationMarkTriangle size={20} />,
      title: t("Dashboard.queue.reportsTitle"),
      description: t("Dashboard.queue.reportsDescription"),
      count: "۳",
      tone: "neutral" as const,
    },
  ];

  const activity = [
    {
      icon: <CheckCircle size={18} />,
      title: t("Dashboard.activity.clubApproved"),
      meta: t("Dashboard.activity.clubApprovedMeta"),
      tone: "success" as const,
    },
    {
      icon: <UsersThree size={18} />,
      title: t("Dashboard.activity.coachJoined"),
      meta: t("Dashboard.activity.coachJoinedMeta"),
      tone: "accent" as const,
    },
    {
      icon: <CreditCard size={18} />,
      title: t("Dashboard.activity.settlementCreated"),
      meta: t("Dashboard.activity.settlementCreatedMeta"),
      tone: "neutral" as const,
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
            <span className={styles.sampleLabel()}>
              {t("Dashboard.sampleData")}
            </span>
            <Button variant="outline" onPress={() => navigate("/dashboard/users")}>
              <UsersThree size={18} />
              {t("nav.users")}
            </Button>
            <Button variant="outline">
              <ArrowRotateClockwise1 size={18} />
              {t("Dashboard.refresh")}
            </Button>
          </div>
        </section>

        <Card className={styles.metricsRail()}>
          <Card.Content className={styles.metricsContent()}>
            {metrics.map((metric) => (
              <article className={styles.metric()} key={metric.label}>
                <div className={styles.metricTop()}>
                  <span className={styles.metricIcon({ tone: metric.tone })}>
                    {metric.icon}
                  </span>
                  <span
                    className={styles.metricTrend({
                      direction: metric.direction,
                    })}
                  >
                    {metric.direction === "up" ? (
                      <ArrowTrendUp size={15} />
                    ) : (
                      <ArrowTrendDown size={15} />
                    )}
                    {metric.trend}
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
                <span className={styles.revenueValue()}>۲٫۱ میلیارد</span>
                <span className={styles.revenueUnit()}>
                  {t("Dashboard.revenue.unit")}
                </span>
              </div>
            </Card.Header>
            <Card.Content className={styles.chartContent()}>
              <div
                className={styles.chart()}
                aria-label={t("Dashboard.revenue.chartAriaLabel")}
                role="img"
              >
                {chartData.map((item) => (
                  <div className={styles.chartColumn()} key={item.day}>
                    <div className={styles.chartTrack()}>
                      <span
                        className={styles.chartBar()}
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <span className={styles.chartDay()}>{item.day}</span>
                  </div>
                ))}
              </div>
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
              <span className={styles.queueTotal()}>۲۸</span>
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
              <Button fullWidth variant="secondary">
                {t("Dashboard.queue.action")}
                <ArrowForward2 size={17} />
              </Button>
            </Card.Footer>
          </Card>
        </div>

        <div className={styles.secondaryGrid()}>
          <Card className={styles.activityCard()}>
            <Card.Header className={styles.cardHeader()}>
              <div>
                <Card.Title className={styles.cardTitle()}>
                  {t("Dashboard.activity.title")}
                </Card.Title>
                <Card.Description className={styles.cardDescription()}>
                  {t("Dashboard.activity.description")}
                </Card.Description>
              </div>
            </Card.Header>
            <Card.Content className={styles.activityContent()}>
              {activity.map((item) => (
                <div className={styles.activityItem()} key={item.title}>
                  <span className={styles.activityIcon({ tone: item.tone })}>
                    {item.icon}
                  </span>
                  <div className={styles.activityCopy()}>
                    <span className={styles.activityTitle()}>{item.title}</span>
                    <span className={styles.activityMeta()}>{item.meta}</span>
                  </div>
                </div>
              ))}
            </Card.Content>
          </Card>

          <Card className={styles.healthCard()} variant="tertiary">
            <Card.Header className={styles.healthHeader()}>
              <div>
                <Card.Title className={styles.cardTitle()}>
                  {t("Dashboard.health.title")}
                </Card.Title>
                <Card.Description className={styles.cardDescription()}>
                  {t("Dashboard.health.description")}
                </Card.Description>
              </div>
              <span className={styles.healthScore()}>۹۶٪</span>
            </Card.Header>
            <Card.Content className={styles.healthContent()}>
              <div className={styles.healthRow()}>
                <span>{t("Dashboard.health.api")}</span>
                <span className={styles.healthStatus()}>
                  {t("Dashboard.health.operational")}
                </span>
              </div>
              <div className={styles.healthRow()}>
                <span>{t("Dashboard.health.sms")}</span>
                <span className={styles.healthStatus()}>
                  {t("Dashboard.health.operational")}
                </span>
              </div>
              <div className={styles.healthRow()}>
                <span>{t("Dashboard.health.payment")}</span>
                <span className={styles.healthStatus({ state: "warning" })}>
                  {t("Dashboard.health.sandbox")}
                </span>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
