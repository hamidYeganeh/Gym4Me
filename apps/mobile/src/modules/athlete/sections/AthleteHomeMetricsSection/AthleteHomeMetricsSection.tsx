"use client";

import { useEffect, useMemo, useState } from "react";
import { statsColors } from "@repo/theme/stats-colors";
import type { MetricGoal, ProgressMetric } from "@repo/api";
import { Fire1 } from "@repo/icons/Fire1";
import { FootSteps } from "@repo/icons/FootSteps";
import { MetricCard } from "@repo/ui/cards/MetricCard";
import { EmptyState } from "@repo/ui/kit/EmptyState";
import { AppSectionHeader } from "@repo/ui/layout/AppSectionHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";
import { accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import {
  goalForMetric,
  goalPercent,
  hasMetricSamples,
  HOME_ACTIVE_MINUTES_KEY,
  HOME_STEPS_KEY,
  lastSevenLocalDays,
  normalizeBarSeries,
  weekSeries,
} from "../../lib/athlete-home-metrics";
import { athleteHomeMetricsSectionVariants } from "./AthleteHomeMetricsSection.styles";
import type { AthleteHomeMetricsSectionProps } from "./AthleteHomeMetricsSection.types";

const WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

type HomeMetricsState = {
  goals: MetricGoal[];
  steps: ProgressMetric[];
  activeMinutes: ProgressMetric[];
};

function formatCount(value: number): string {
  return toPersianDigits(Math.round(value).toLocaleString("fa-IR"));
}

export function AthleteHomeMetricsSection({
  className,
}: AthleteHomeMetricsSectionProps) {
  const t = useTranslations("AthleteHome");
  const styles = athleteHomeMetricsSectionVariants();
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();
  const [state, setState] = useState<HomeMetricsState | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setState({ goals: [], steps: [], activeMinutes: [] });
      return;
    }

    const days = lastSevenLocalDays();
    const from = days[0];
    const to = new Date();
    if (!from) {
      setState({ goals: [], steps: [], activeMinutes: [] });
      return;
    }

    let cancelled = false;
    void Promise.all([
      accountProgress.listGoals({ status: "active", page_size: 50 }),
      accountProgress.listMetrics({
        from: from.toISOString(),
        metricKey: HOME_STEPS_KEY,
        page_size: 100,
        to: to.toISOString(),
      }),
      accountProgress.listMetrics({
        from: from.toISOString(),
        metricKey: HOME_ACTIVE_MINUTES_KEY,
        page_size: 100,
        to: to.toISOString(),
      }),
    ])
      .then(([goalsPage, stepsPage, activePage]) => {
        if (cancelled) return;
        setState({
          activeMinutes: activePage.result,
          goals: goalsPage.result,
          steps: stepsPage.result,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ goals: [], steps: [], activeMinutes: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  const days = useMemo(() => lastSevenLocalDays(), []);
  const stepsSeries = useMemo(
    () => (state ? weekSeries(state.steps, days) : []),
    [days, state],
  );
  const activeSeries = useMemo(
    () => (state ? weekSeries(state.activeMinutes, days) : []),
    [days, state],
  );
  const todaySteps = stepsSeries[6] ?? 0;
  const todayActive = activeSeries[6] ?? 0;
  const yesterdayActive = activeSeries[5] ?? 0;
  const hasData =
    state != null &&
    (hasMetricSamples(state.steps) || hasMetricSamples(state.activeMinutes));

  const stepsGoal = state
    ? goalForMetric(state.goals, HOME_STEPS_KEY)
    : undefined;
  const stepsStatus = stepsGoal
    ? t("metricsGoalStatus", {
        percent: toPersianDigits(
          goalPercent(todaySteps, stepsGoal.target.value),
        ),
      })
    : undefined;

  const activeDelta = Math.round(todayActive - yesterdayActive);
  const activeStatus =
    !hasMetricSamples(state?.activeMinutes ?? [])
      ? undefined
      : activeDelta > 0
        ? t("metricsMoreThanYesterday", {
            minutes: toPersianDigits(activeDelta),
          })
        : activeDelta < 0
          ? t("metricsLessThanYesterday", {
              minutes: toPersianDigits(Math.abs(activeDelta)),
            })
          : t("metricsSameAsYesterday");

  return (
    <section
      aria-labelledby="athlete-overview-title"
      className={styles.root({ className })}
    >
      <AppSectionHeader
        actionAriaLabel={t("metricsAction")}
        actionLabel={t("seeAll")}
        description={t("overviewDescription")}
        id="athlete-overview-title"
        onAction={() => router.push("/athlete/metrics")}
        title={t("overviewTitle")}
      />

      {state == null ? null : !hasData ? (
        <EmptyState
          className={styles.empty()}
          description={t("metricsEmptyDescription")}
          primaryAction={{
            label: t("metricsEmptyAction"),
            onPress: () => router.push("/athlete/metrics/log"),
          }}
          title={t("metricsEmptyTitle")}
        />
      ) : (
        <div className={styles.grid()}>
          <MetricCard
            chart={{ type: "bars", series: normalizeBarSeries(stepsSeries) }}
            color="var(--accent)"
            dayLabels={WEEKDAY_LABELS}
            icon={<FootSteps size={18} />}
            onPress={() => router.push("/athlete/metrics")}
            periodLabel={t("today")}
            status={stepsStatus}
            title={t("stepsTitle")}
            unit={t("stepsUnit")}
            value={formatCount(todaySteps)}
          />
          <MetricCard
            chart={{ type: "line", series: activeSeries }}
            color={statsColors.red}
            dayLabels={WEEKDAY_LABELS}
            icon={<Fire1 size={18} />}
            onPress={() => router.push("/athlete/metrics")}
            periodLabel={t("today")}
            status={activeStatus}
            title={t("activeMinutesTitle")}
            unit={t("activeMinutesUnit")}
            value={formatCount(todayActive)}
          />
        </div>
      )}
    </section>
  );
}
