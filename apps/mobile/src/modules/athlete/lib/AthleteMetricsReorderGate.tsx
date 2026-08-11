"use client";

import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { accountProfile, accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteMetricsReorderScreen } from "../screens/AthleteMetricsReorderScreen";
import {
  DEFAULT_REORDERABLE_METRICS,
  type ReorderableMetric,
  type ReorderableMetricId,
} from "./metrics-reorder-data";
import {
  metricKeyToUiId,
  uiIdToMetricKey,
} from "./AthleteMetricsGate";

export function AthleteMetricsReorderGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [metrics, setMetrics] = useState<ReorderableMetric[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setMetrics(DEFAULT_REORDERABLE_METRICS);
      return;
    }

    let cancelled = false;
    Promise.all([
      accountProgress.listMetricTypes({ page_size: 50 }),
      accountProfile.getAthlete().catch(() => null),
    ])
      .then(([typesPage, athlete]) => {
        if (cancelled) return;
        const preferred = athlete?.metrics.preferredKeys ?? [];
        const keys =
          preferred.length > 0
            ? preferred
            : typesPage.result.map((type) => type.key);
        const mapped: ReorderableMetric[] = keys.map((key) => ({
          id: metricKeyToUiId(key) as ReorderableMetricId,
        }));
        setMetrics(
          mapped.length > 0 ? mapped : DEFAULT_REORDERABLE_METRICS,
        );
      })
      .catch(() => {
        if (!cancelled) setMetrics(DEFAULT_REORDERABLE_METRICS);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!metrics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteMetricsReorderScreen
      initialMetrics={metrics}
      onPersist={async (next) => {
        if (!isAuthenticated) return;
        await accountProfile.updateAthlete({
          metrics: {
            preferredKeys: next.map((item) => uiIdToMetricKey(item.id)),
          },
        });
      }}
    />
  );
}
