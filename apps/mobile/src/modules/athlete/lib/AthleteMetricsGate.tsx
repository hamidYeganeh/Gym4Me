"use client";

import { Spinner } from "@heroui/react";
import { statsColors } from "@repo/theme";
import type { MetricType } from "@repo/api";
import { useEffect, useState } from "react";
import { accountProfile, accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteMetricsScreen } from "../screens/AthleteMetricsScreen";
import {
  ATHLETE_METRICS,
  METRICS_PROMO_IMAGE,
  type AthleteMetricDefinition,
  type AthleteMetricId,
} from "./metrics-overview-data";

/** API keys use snake_case; mobile cards historically used kebab-case. */
export function metricKeyToUiId(key: string): string {
  return key.replace(/_kg$/, "").replace(/_/g, "-");
}

export function uiIdToMetricKey(id: string): string {
  if (id === "weight") return "weight_kg";
  return id.replace(/-/g, "_");
}

function chartFromType(type: MetricType): AthleteMetricDefinition["chart"] {
  const kind = type.chartKind ?? "line";
  if (kind === "stacked") {
    return {
      type: "stacked",
      series: [
        [2, 2, 1],
        [3, 2, 2],
        [2, 1, 1],
        [3, 3, 2],
        [2, 2, 2],
        [3, 2, 1],
        [3, 3, 2],
      ],
    };
  }
  if (kind === "range") {
    return {
      type: "range",
      series: [
        { low: 78, high: 122 },
        { low: 76, high: 118 },
        { low: 80, high: 125 },
        { low: 74, high: 120 },
        { low: 79, high: 128 },
        { low: 77, high: 124 },
        { low: 80, high: 120 },
      ],
    };
  }
  if (kind === "rings") {
    return {
      type: "rings",
      series: [
        { value: 0.9, met: true },
        { value: 0.85, met: true },
        { value: 0.4, met: false },
        { value: 0.92, met: true },
        { value: 0.35, met: false },
        { value: 0.9, met: true },
        { value: 0.28, met: false },
      ],
    };
  }
  return {
    type: "line",
    series: [64, 65, 64.5, 66, 65.2, 66.1, 65.7],
    curve: "monotone",
  };
}

function colorForIndex(index: number): string {
  const colors = [
    statsColors.orange,
    statsColors.red,
    statsColors.blue,
    statsColors.purple,
    statsColors.yellow,
    "var(--success)",
    "var(--muted)",
  ];
  return colors[index % colors.length]!;
}

function mapCatalog(
  types: MetricType[],
  preferredKeys: string[],
): AthleteMetricDefinition[] {
  const byKey = new Map(types.map((type) => [type.key, type]));
  const orderedKeys =
    preferredKeys.length > 0
      ? preferredKeys
      : types.map((type) => type.key);

  const mapped: AthleteMetricDefinition[] = [];
  for (const key of orderedKeys) {
    const type = byKey.get(key);
    if (!type) continue;
    const uiId = metricKeyToUiId(type.key);
    mapped.push({
      id: uiId as AthleteMetricId,
      href:
        uiId === "weight"
          ? "/athlete/metrics/weight"
          : "/athlete/metrics",
      color: colorForIndex(mapped.length),
      chart: chartFromType(type),
    });
  }
  return mapped.length > 0 ? mapped : ATHLETE_METRICS;
}

export function AthleteMetricsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [metrics, setMetrics] = useState<AthleteMetricDefinition[] | null>(
    null,
  );

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setMetrics(ATHLETE_METRICS);
      return;
    }

    let cancelled = false;
    Promise.all([
      accountProgress.listMetricTypes({ page_size: 50 }),
      accountProfile.getAthlete().catch(() => null),
    ])
      .then(([typesPage, athlete]) => {
        if (cancelled) return;
        setMetrics(
          mapCatalog(
            typesPage.result,
            athlete?.metrics.preferredKeys ?? [],
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setMetrics(ATHLETE_METRICS);
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
    <AthleteMetricsScreen metrics={metrics} promoImage={METRICS_PROMO_IMAGE} />
  );
}
