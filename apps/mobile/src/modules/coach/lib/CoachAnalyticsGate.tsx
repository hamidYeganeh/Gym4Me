"use client";

import { Spinner } from "@heroui/react/spinner";
import type { CoachAnalyticsOverview } from "@repo/api";
import { useEffect, useState } from "react";
import { accountCoaching } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachAnalyticsScreen } from "../screens/CoachAnalyticsScreen";
import {
  COACH_ANALYTICS,
  type CoachAnalyticsData,
  type CoachAnalyticsPeriod,
} from "./coach-analytics-data";

function mapOverview(
  overview: CoachAnalyticsOverview,
  period: CoachAnalyticsPeriod,
): CoachAnalyticsData {
  return {
    ...COACH_ANALYTICS,
    periods: {
      ...COACH_ANALYTICS.periods,
      [period]: {
        kpis: overview.kpis,
        sessionsTrend: overview.kpis.sessionsSeries.map((value, index) => ({
          label: String(index + 1),
          value,
        })),
        busiestHours: COACH_ANALYTICS.periods[period].busiestHours,
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
      setAnalytics(COACH_ANALYTICS);
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
        if (!cancelled) setAnalytics(COACH_ANALYTICS);
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
