"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OwnerAnalyticsPeriodId } from "../../lib/owner-analytics-data";
import { ownerAnalyticsScreenStyles as styles } from "./OwnerAnalyticsScreen.styles";
import type { OwnerAnalyticsScreenProps } from "./OwnerAnalyticsScreen.types";

const PERIOD_LABEL_KEY: Record<
  OwnerAnalyticsPeriodId,
  "periodWeek" | "periodMonth" | "periodQuarter"
> = {
  week: "periodWeek",
  month: "periodMonth",
  quarter: "periodQuarter",
};

const KPI_LABEL_KEY = {
  "new-members": {
    title: "kpiNewMembersTitle",
    unit: "kpiNewMembersUnit",
  },
  renewal: { title: "kpiRenewalTitle", unit: "kpiRenewalUnit" },
  churn: { title: "kpiChurnTitle", unit: "kpiChurnUnit" },
  attendance: { title: "kpiAttendanceTitle", unit: "kpiAttendanceUnit" },
} as const;

export function OwnerAnalyticsScreen({
  datasets,
  periods,
  className,
}: OwnerAnalyticsScreenProps) {
  const t = useTranslations("OwnerAnalytics");
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<OwnerAnalyticsPeriodId>(
    periods[0] ?? "week",
  );

  const dataset = datasets[activePeriod];

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <div
          aria-label={t("periodsLabel")}
          className={styles.periods}
          role="group"
        >
          {periods.map((period) => (
            <Button
              key={period}
              className={styles.periodChip}
              onPress={() => setActivePeriod(period)}
              size="sm"
              variant={activePeriod === period ? "primary" : "ghost"}
            >
              {t(PERIOD_LABEL_KEY[period])}
            </Button>
          ))}
        </div>

        <div className={styles.statsGrid}>
          {dataset.kpis.map((kpi) =>
            kpi.chart === "bar" ? (
              <StatsCard
                key={kpi.id}
                chart="bar"
                color={kpi.color}
                series={kpi.series}
                title={t(KPI_LABEL_KEY[kpi.id].title)}
                unit={t(KPI_LABEL_KEY[kpi.id].unit)}
                value={kpi.value}
              />
            ) : (
              <StatsCard
                key={kpi.id}
                chart="line"
                color={kpi.color}
                comparisonSeries={kpi.comparisonSeries}
                series={kpi.series}
                title={t(KPI_LABEL_KEY[kpi.id].title)}
                unit={t(KPI_LABEL_KEY[kpi.id].unit)}
                value={kpi.value}
              />
            ),
          )}
        </div>

        <div className={styles.chartCard}>
          <Typography
            className={styles.chartTitle}
            type="body"
            weight="semibold"
          >
            {t("membershipTrendTitle")}
          </Typography>
          <AreaLineChart
            aria-label={t("membershipTrendTitle")}
            className={styles.chart}
            data={dataset.membershipTrend}
          />
        </div>

        <div className={styles.chartCard}>
          <Typography
            className={styles.chartTitle}
            type="body"
            weight="semibold"
          >
            {t("busyHoursTitle")}
          </Typography>
          <div className={styles.barRows}>
            {dataset.busyHours.map((row) => (
              <div key={row.id} className={styles.barRow}>
                <div className={styles.barRowHeader}>
                  <Typography
                    className={styles.barRowLabel}
                    type="body-sm"
                    weight="medium"
                  >
                    {row.label}
                  </Typography>
                  <span className={styles.barRowValue}>٪{row.percent}</span>
                </div>
                <span aria-hidden className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{ width: `${row.percent}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <Typography
            className={styles.chartTitle}
            type="body"
            weight="semibold"
          >
            {t("classPopularityTitle")}
          </Typography>
          <div className={styles.barRows}>
            {dataset.classPopularity.map((row) => (
              <div key={row.id} className={styles.barRow}>
                <div className={styles.barRowHeader}>
                  <Typography
                    className={styles.barRowLabel}
                    type="body-sm"
                    weight="medium"
                  >
                    {row.label}
                  </Typography>
                  <span className={styles.barRowValue}>{row.countLabel}</span>
                </div>
                <span aria-hidden className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{ width: `${row.percent}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <div>
            <Typography
              className={styles.chartTitle}
              type="body"
              weight="semibold"
            >
              {t("funnelTitle")}
            </Typography>
            <Typography className={styles.chartHint} type="body-sm">
              {t("funnelHint")}
            </Typography>
          </div>
          <div className={styles.funnelSteps}>
            {dataset.funnel.map((step) => (
              <div key={step.id} className={styles.funnelStep}>
                <div className={styles.funnelHeader}>
                  <span className={styles.funnelLabelGroup}>
                    <Typography
                      className={styles.funnelLabel}
                      type="body-sm"
                      weight="medium"
                    >
                      {step.label}
                    </Typography>
                    {step.conversionLabel ? (
                      <Chip color="accent" size="sm" variant="soft">
                        <Chip.Label>{step.conversionLabel}</Chip.Label>
                      </Chip>
                    ) : null}
                  </span>
                  <span className={styles.funnelValue}>{step.valueLabel}</span>
                </div>
                <span aria-hidden className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{ width: `${step.percent}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
