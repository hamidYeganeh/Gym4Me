"use client";

import { Spinner } from "@heroui/react/spinner";
import type { CoachAnalyticsOverview } from "@repo/api";
import { useEffect, useState } from "react";
import { accountCoaching } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachAnalyticsScreen } from "../screens/CoachAnalyticsScreen";
import {
  COACH_ANALYTICS,
  type CoachAnalyticsData,
  type CoachAnalyticsPeriod,
} from "./coach-analytics-data";

const EMPTY_DATASET: CoachAnalyticsData["periods"][CoachAnalyticsPeriod] = {
  kpis: {
    sessionsSeries: [],
    sessionsValue: "۰",
    activeClientsSeries: [],
    activeClientsValue: "۰",
    retentionSeries: [],
    retentionComparisonSeries: [],
    retentionValue: "۰",
    cancellationsSeries: [],
    cancellationsValue: "۰",
  },
  sessionsTrend: [],
  busiestHours: [],
};

function emptyAnalytics(): CoachAnalyticsData {
  return {
    periods: {
      week: EMPTY_DATASET,
      month: EMPTY_DATASET,
      quarter: EMPTY_DATASET,
    },
    ratingAverage: "—",
    ratingCountLabel: "—",
    starDistribution: [],
    recentReviews: [],
  };
}

function mapOverview(
  overview: CoachAnalyticsOverview,
  period: CoachAnalyticsPeriod,
): CoachAnalyticsData {
  const empty = emptyAnalytics();
  return {
    ...empty,
    periods: {
      ...empty.periods,
      [period]: {
        kpis: overview.kpis,
        sessionsTrend: overview.kpis.sessionsSeries.map((value, index) => ({
          label: String(index + 1),
          value,
        })),
        busiestHours: [],
      },
    },
  };
}

export function CoachAnalyticsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [analytics, setAnalytics] = useState<CoachAnalyticsData | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setAnalytics(DEMO_MODE ? COACH_ANALYTICS : emptyAnalytics());
      return;
    }

    let cancelled = false;
    accountCoaching
      .analyticsOverview("week")
      .then((overview) => {
        if (cancelled) return;
        setAnalytics(mapOverview(overview, "week"));
      })
      .catch(() => {
        if (!cancelled) {
          setAnalytics(DEMO_MODE ? COACH_ANALYTICS : emptyAnalytics());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!analytics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <CoachAnalyticsScreen analytics={analytics} />;
}
