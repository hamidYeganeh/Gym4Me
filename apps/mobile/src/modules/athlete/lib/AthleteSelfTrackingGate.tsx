"use client";

import { Button, Spinner, Typography } from "@heroui/react";
import type { PersonalRecord, ProgressMetric } from "@repo/api";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { accountProgress } from "@/shared/lib/api";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteSelfTrackingScreen } from "../screens/AthleteSelfTrackingScreen";
import {
  getSelfTrackingMetric,
  type SelfTrackingMetricKey,
} from "./self-tracking-data";

export function AthleteSelfTrackingGate() {
  const { isAuthenticated, isReady } = useAuth();
  const enabled = useFeatureFlag("athlete.self_tracking");
  const personalRecordsEnabled = useFeatureFlag("athlete.personal_records");
  const searchParams = useSearchParams();
  const requestedMetric = searchParams.get("metric") ?? "water_ml";
  const initialMetric = (getSelfTrackingMetric(requestedMetric)?.key ??
    "water_ml") as SelfTrackingMetricKey;
  const [metrics, setMetrics] = useState<ProgressMetric[] | null>(null);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setMetrics([]);
      setRecords([]);
      return;
    }
    const [metricPage, recordPage] = await Promise.all([
      accountProgress.listMetrics({ page_size: 200 }),
      accountProgress.listPersonalRecords({ page_size: 100 }),
    ]);
    setMetrics(metricPage.result);
    setRecords(recordPage.result);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady || !enabled) return;
    void load().catch(() => {
      setMetrics([]);
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
          این قابلیت می‌تواند از پنل انتشار Gym4Me دوباره فعال شود.
        </Typography>
        <Button onPress={() => history.back()} variant="secondary">
          بازگشت
        </Button>
      </main>
    );
  }

  if (!metrics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteSelfTrackingScreen
      initialMetric={initialMetric}
      metrics={metrics}
      onCreateMetric={async (input) => {
        setPending(true);
        try {
          await accountProgress.createMetric({ ...input, privacy: "private" });
          await load();
        } finally {
          setPending(false);
        }
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
      pending={pending}
      personalRecords={records}
      personalRecordsEnabled={personalRecordsEnabled}
    />
  );
}

