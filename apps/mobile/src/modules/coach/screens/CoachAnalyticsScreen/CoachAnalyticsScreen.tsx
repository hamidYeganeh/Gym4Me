"use client";

import { useState } from "react";
import { Typography } from "@heroui/react/typography";
import { ReviewCard } from "@repo/ui/cards/ReviewCard";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { CoachAnalyticsPeriod } from "../../lib/coach-analytics-data";
import { coachAnalyticsScreenStyles as styles } from "./CoachAnalyticsScreen.styles";
import type { CoachAnalyticsScreenProps } from "./CoachAnalyticsScreen.types";

const PERIODS: CoachAnalyticsPeriod[] = ["week", "month", "quarter"];

const PERIOD_LABEL_KEY: Record<CoachAnalyticsPeriod, string> = {
  week: "periodWeek",
  month: "periodMonth",
  quarter: "periodQuarter",
};

export function CoachAnalyticsScreen({ analytics }: CoachAnalyticsScreenProps) {
  const t = useTranslations("CoachAnalytics");
  const router = useRouter();
  const [period, setPeriod] = useState<CoachAnalyticsPeriod>("week");

  const dataset = analytics.periods[period];
  const { kpis } = dataset;

  return (
    <AppLayout
      className={styles.root}
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

        <FilterChipBar aria-label={t("periodsLabel")}>
          {PERIODS.map((item) => (
            <FilterChip
              key={item}
              onPress={() => setPeriod(item)}
              selected={period === item}
            >
              {t(PERIOD_LABEL_KEY[item])}
            </FilterChip>
          ))}
        </FilterChipBar>

        <section className={styles.statsGrid}>
          <StatsCard
            chart="line"
            color="var(--stats-blue)"
            series={kpis.sessionsSeries}
            title={t("kpiSessions")}
            unit={t("kpiSessionsUnit")}
            value={kpis.sessionsValue}
          />
          <StatsCard
            chart="line"
            color="var(--stats-purple)"
            series={kpis.activeClientsSeries}
            title={t("kpiActiveClients")}
            unit={t("kpiActiveClientsUnit")}
            value={kpis.activeClientsValue}
          />
          <StatsCard
            chart="line"
            color="var(--stats-yellow)"
            comparisonSeries={kpis.retentionComparisonSeries}
            series={kpis.retentionSeries}
            title={t("kpiRetention")}
            unit={t("kpiRetentionUnit")}
            value={kpis.retentionValue}
          />
          <StatsCard
            chart="bar"
            color="var(--stats-red)"
            series={kpis.cancellationsSeries}
            title={t("kpiCancellations")}
            unit={t("kpiCancellationsUnit")}
            value={kpis.cancellationsValue}
          />
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("trendTitle")}
          </Typography>
          <div className={styles.chartCard}>
            <AreaLineChart
              aria-label={t("trendChartLabel")}
              data={dataset.sessionsTrend}
            />
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("busiestHoursTitle")}
          </Typography>
          <div className={styles.hoursCard}>
            {dataset.busiestHours.map((hour) => (
              <div className={styles.hourRow} key={hour.id}>
                <Typography className={styles.hourLabel} type="body-sm">
                  {hour.label}
                </Typography>
                <span
                  aria-label={t("busiestHourBarLabel", {
                    label: hour.label,
                    value: hour.valueLabel,
                  })}
                  className={styles.hourTrack}
                  role="img"
                >
                  <span
                    className={styles.hourFill}
                    style={{ width: `${hour.percent}%` }}
                  />
                </span>
                <Typography className={styles.hourValue} type="body-sm">
                  {hour.valueLabel}
                </Typography>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("ratingsTitle")}
          </Typography>
          <div className={styles.ratingCard}>
            <div className={styles.ratingTop}>
              <Typography
                className={styles.ratingAverage}
                type="h1"
                weight="bold"
              >
                {analytics.ratingAverage}
              </Typography>
              <div className={styles.ratingMeta}>
                <Typography type="body" weight="semibold">
                  {t("ratingsAverageLabel")}
                </Typography>
                <Typography className={styles.ratingCaption} type="body-sm">
                  {analytics.ratingCountLabel}
                </Typography>
              </div>
            </div>
            <div className={styles.starRows}>
              {analytics.starDistribution.map((row) => (
                <div className={styles.starRow} key={row.stars}>
                  <Typography className={styles.starLabel} type="body-sm">
                    {t("starLabel", { stars: row.stars })}
                  </Typography>
                  <span
                    aria-label={t("starBarLabel", {
                      stars: row.stars,
                      percent: row.percent,
                    })}
                    className={styles.starTrack}
                    role="img"
                  >
                    <span
                      className={styles.starFill}
                      style={{ width: `${row.percent}%` }}
                    />
                  </span>
                  <Typography className={styles.starPercent} type="body-sm">
                    {t("starPercent", { percent: row.percent })}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="h4" weight="semibold">
            {t("recentReviewsTitle")}
          </Typography>
          <div className={styles.reviews}>
            {analytics.recentReviews.map((review) => (
              <ReviewCard
                avatar={review.avatar}
                avatarAlt={review.reviewer}
                content={review.content}
                date={review.dateLabel}
                dislikeLabel={t("reviewDislike")}
                key={review.id}
                likeLabel={t("reviewLike")}
                rating={review.rating}
                reportLabel={t("reviewReport")}
                title={review.title}
              />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
