"use client";

import { Spinner } from "@heroui/react/spinner";
import type { ProgressMetric } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteWeightHistoryScreen } from "../screens/AthleteWeightHistoryScreen";
import type { MetricSlug } from "./weight/metrics";
import {
  WEIGHT_HISTORY,
  type WeightHistoryEntry,
} from "./weight/weight-history-data";

function toDateKey(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "today";
  if (sameDay(date, yesterday)) return "yesterday";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function metricKeyForSlug(metric: MetricSlug): string {
  if (metric === "weight") return "weight_kg";
  return String(metric).replace(/-/g, "_");
}

function mapMetrics(items: ProgressMetric[]): WeightHistoryEntry[] {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );

  return sorted.map((item, index) => {
    const recorded = new Date(item.recordedAt);
    const previous = sorted[index + 1];
    const showAlert =
      previous != null && item.value > previous.value + 0.4;

    return {
      id: item.id,
      kg: item.value,
      hours: recorded.getHours(),
      minutes: recorded.getMinutes(),
      dateKey: toDateKey(recorded),
      status: "goalCompleted" as const,
      showAlert,
    };
  });
}

export function AthleteWeightHistoryGate({ metric }: { metric: MetricSlug }) {
  const { isAuthenticated, isReady } = useAuth();
  const [entries, setEntries] = useState<WeightHistoryEntry[] | null>(null);

  const reload = useCallback(async () => {
    const page = await accountProgress.listMetrics({
      page_size: 100,
      metricKey: metricKeyForSlug(metric),
    });
    setEntries(
      page.result.length > 0 ? mapMetrics(page.result) : WEIGHT_HISTORY,
    );
  }, [metric]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setEntries(WEIGHT_HISTORY);
      return;
    }

    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) setEntries(WEIGHT_HISTORY);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  const handleDelete = useCallback(
    async (id: string) => {
      setEntries((current) =>
        current ? current.filter((entry) => entry.id !== id) : current,
      );
      if (!isAuthenticated) return;
      try {
        await accountProgress.deleteMetric(id);
      } catch {
        await reload();
      }
    },
    [isAuthenticated, reload],
  );

  if (!entries) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteWeightHistoryScreen
      entries={entries}
      metric={metric}
      onDelete={handleDelete}
    />
  );
}
