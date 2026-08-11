"use client";

import { Spinner } from "@heroui/react";
import type { OwnerFinanceAnalytics } from "@repo/api";
import { statsColors } from "@repo/theme";
import { useEffect, useState } from "react";
import { accountClubs, accountFinance } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerAnalyticsScreen } from "../screens/OwnerAnalyticsScreen";
import {
  OWNER_ANALYTICS,
  OWNER_ANALYTICS_PERIODS,
  type OwnerAnalyticsDataset,
  type OwnerAnalyticsPeriodId,
} from "./owner-analytics-data";

function mapAnalytics(
  overview: OwnerFinanceAnalytics,
): Record<OwnerAnalyticsPeriodId, OwnerAnalyticsDataset> {
  const dataset: OwnerAnalyticsDataset = {
    kpis: overview.kpis.map((kpi) => ({
      id: kpi.id as OwnerAnalyticsDataset["kpis"][number]["id"],
      value: kpi.value,
      chart: kpi.chart,
      color:
        kpi.id === "renewal"
          ? statsColors.yellow
          : kpi.id === "churn"
            ? statsColors.red
            : kpi.id === "attendance"
              ? statsColors.purple
              : statsColors.blue,
      series: kpi.series,
      comparisonSeries: kpi.comparisonSeries,
    })),
    membershipTrend: overview.kpis[0]?.series.map((value, index) => ({
      label: String(index + 1),
      value,
    })) ?? [],
    busyHours: OWNER_ANALYTICS.week.busyHours,
    classPopularity: OWNER_ANALYTICS.week.classPopularity,
    funnel: OWNER_ANALYTICS.week.funnel,
  };

  return {
    week: dataset,
    month: dataset,
    quarter: dataset,
  };
}

export function OwnerAnalyticsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [datasets, setDatasets] = useState<Record<
    OwnerAnalyticsPeriodId,
    OwnerAnalyticsDataset
  > | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setDatasets(OWNER_ANALYTICS);
      return;
    }

    let cancelled = false;
    accountClubs
      .list({ page_size: 1 })
      .then(async (clubs) => {
        const clubId = clubs.result[0]?.id;
        if (!clubId) {
          if (!cancelled) setDatasets(OWNER_ANALYTICS);
          return;
        }
        const overview = await accountFinance.ownerAnalytics(clubId, "week");
        if (!cancelled) setDatasets(mapAnalytics(overview));
      })
      .catch(() => {
        if (!cancelled) setDatasets(OWNER_ANALYTICS);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!datasets) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <OwnerAnalyticsScreen
      datasets={datasets}
      periods={OWNER_ANALYTICS_PERIODS}
    />
  );
}
