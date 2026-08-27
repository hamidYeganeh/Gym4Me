"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Typography } from "@heroui/react/typography";
import type {
  MetricType,
  MetricsSummaryItem,
  PersonalRecord,
  ProgressMetric,
} from "@repo/api";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { accountProgress } from "@/shared/lib/api";
import {
  createClientMutationId,
  enqueue,
  flush,
  isNetworkFailure,
  listPending,
  type OfflineQueueItem,
} from "@/shared/lib/offline-queue";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteSelfTrackingScreen } from "../screens/AthleteSelfTrackingScreen";
import {
  getSelfTrackingMetric,
  mapMetricTypesToCatalog,
  type SelfTrackingMetric,
  type SelfTrackingMetricKey,
} from "./self-tracking-data";

export function AthleteSelfTrackingGate() {
  const { isAuthenticated, isReady } = useAuth();
  const enabled = useFeatureFlag("athlete.self_tracking");
  const personalRecordsEnabled = useFeatureFlag("athlete.personal_records");
  const searchParams = useSearchParams();
  const requestedMetric = searchParams.get("metric") ?? "water_ml";
  const [catalog, setCatalog] = useState<SelfTrackingMetric[] | null>(null);
  const [metrics, setMetrics] = useState<ProgressMetric[] | null>(null);
  const [summary, setSummary] = useState<MetricsSummaryItem[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [pendingItems, setPendingItems] = useState<OfflineQueueItem[]>([]);
  const [pending, setPending] = useState(false);

  const initialMetric = (getSelfTrackingMetric(requestedMetric)?.key ??
    catalog?.[0]?.key ??
    "water_ml") as SelfTrackingMetricKey;

  const refreshPending = useCallback(async () => {
    setPendingItems(await listPending());
  }, []);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setCatalog(mapMetricTypesToCatalog([]));
      setMetrics([]);
      setSummary([]);
      setRecords([]);
      setPendingItems([]);
      return;
    }

    await flush().catch(() => undefined);

    const [typesPage, metricPage, recordPage, summaryResult, pendingQueue] =
      await Promise.all([
        accountProgress.listMetricTypes({ page_size: 100 }).catch(
          (): { result: MetricType[] } => ({ result: [] }),
        ),
        accountProgress.listMetrics({ page_size: 200 }),
        accountProgress.listPersonalRecords({ page_size: 100 }),
        accountProgress
          .metricsSummary({})
          .catch(() => ({ items: [] as MetricsSummaryItem[] })),
        listPending(),
      ]);

    setCatalog(mapMetricTypesToCatalog(typesPage.result));
    setMetrics(metricPage.result);
    setRecords(recordPage.result);
    setSummary(summaryResult.items);
    setPendingItems(pendingQueue);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady || !enabled) return;
    void load().catch(() => {
      setCatalog(mapMetricTypesToCatalog([]));
      setMetrics([]);
      setSummary([]);
      setRecords([]);
    });
  }, [enabled, isReady, load]);

  if (!enabled) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-8 text-center">
        <Typography type="h3" weight="bold">
          ثبت فعالیت فعلاً در دسترس نیست
        </Typography>
        <Typography className="text-muted" type="body">
          <TextWithBrand>
            این قابلیت می‌تواند از پنل انتشار Gym4Me دوباره فعال شود.
          </TextWithBrand>
        </Typography>
        <Button onPress={() => history.back()} variant="secondary">
          بازگشت
        </Button>
      </main>
    );
  }

  if (!metrics || !catalog) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteSelfTrackingScreen
      catalog={catalog}
      initialMetric={initialMetric}
      metrics={metrics}
      onCreateMetric={async (input) => {
        setPending(true);
        const clientMutationId = createClientMutationId("metric");
        const payload = {
          ...input,
          privacy: "private" as const,
          source: "manual" as const,
          clientMutationId,
        };
        try {
          await accountProgress.createMetric(payload);
          await load();
        } catch (error) {
          if (isNetworkFailure(error)) {
            await enqueue(payload);
            await refreshPending();
            return { queuedOffline: true };
          }
          throw error;
        } finally {
          setPending(false);
        }
        return { queuedOffline: false };
      }}
      onCreatePersonalRecord={async (input) => {
        setPending(true);
        try {
          await accountProgress.createPersonalRecord({
            ...input,
            privacy: "private",
          });
          await load();
        } finally {
          setPending(false);
        }
      }}
      onDeleteMetric={async (id) => {
        setPending(true);
        try {
          await accountProgress.deleteMetric(id);
          await load();
        } finally {
          setPending(false);
        }
      }}
      onFlushPending={async () => {
        setPending(true);
        try {
          await flush();
          await load();
        } finally {
          setPending(false);
        }
      }}
      pending={pending}
      pendingQueue={pendingItems}
      personalRecords={records}
      personalRecordsEnabled={personalRecordsEnabled}
      summary={summary}
    />
  );
}
