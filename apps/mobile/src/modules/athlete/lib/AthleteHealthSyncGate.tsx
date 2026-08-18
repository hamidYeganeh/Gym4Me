"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { HealthSyncProvider, HealthSyncState } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import {
  disconnectHealthProvider,
  flushHealthSamples,
  resolveHealthProvider,
  upsertConnectedHealthState,
  useHealthMetricsConnect,
} from "@/shared/lib/health";
import { accountProgress } from "@/shared/lib/api";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteHealthSyncScreen } from "../screens/AthleteHealthSyncScreen";

export function AthleteHealthSyncGate() {
  const { isAuthenticated, isReady } = useAuth();
  const deviceSyncEnabled = useFeatureFlag("health.device_sync");
  const health = useHealthMetricsConnect();
  const [syncStates, setSyncStates] = useState<HealthSyncState[] | null>(null);
  const [pending, setPending] = useState(false);
  const [lastFlushSummary, setLastFlushSummary] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setSyncStates([]);
      return;
    }
    const result = await accountProgress.listHealthSyncStates();
    setSyncStates(result.items);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady || !deviceSyncEnabled) return;
    void load().catch(() => setSyncStates([]));
  }, [isReady, deviceSyncEnabled, load]);

  if (!deviceSyncEnabled) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <Typography type="h3" weight="semibold">
          همگام‌سازی دستگاه غیرفعال است
        </Typography>
        <Typography className="text-muted" type="body">
          پرچم health.device_sync برای این نصب روشن نیست.
        </Typography>
      </div>
    );
  }

  if (!syncStates) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteHealthSyncScreen
      connectStatus={health.status}
      lastFlushSummary={lastFlushSummary}
      onConnect={async () => {
        setPending(true);
        setLastFlushSummary(null);
        try {
          const result = await health.connect();
          if (result.ok && result.status === "connected") {
            const provider = resolveHealthProvider(result.platform);
            if (provider) {
              await upsertConnectedHealthState({
                provider,
                authorization: result.authorization,
                lastSyncAt: new Date().toISOString(),
              });
              await load();
              setLastFlushSummary("مجوز ثبت و وضعیت اتصال به‌روز شد.");
            }
          } else if (result.ok && result.status === "denied") {
            setLastFlushSummary("مجوز خواندن دادهٔ سلامت رد شد.");
          } else {
            setLastFlushSummary(
              result.ok ? null : (result.reason ?? "اتصال ناموفق بود."),
            );
          }
        } finally {
          setPending(false);
        }
      }}
      onDisconnect={async (provider: HealthSyncProvider) => {
        setPending(true);
        try {
          await disconnectHealthProvider(provider);
          await load();
          setLastFlushSummary(
            "اتصال قطع شد؛ نمونه‌های قبلی حذف نشدند.",
          );
        } finally {
          setPending(false);
        }
      }}
      onOpenSettings={
        health.platform === "android"
          ? async () => {
              await health.openSettings();
            }
          : undefined
      }
      onSync={async () => {
        setPending(true);
        setLastFlushSummary(null);
        try {
          // Ensure server knows we are connected before flush.
          if (health.isConnected && health.authorization) {
            const provider = resolveHealthProvider(health.platform);
            if (provider) {
              await upsertConnectedHealthState({
                provider,
                authorization: health.authorization,
              });
            }
          }
          const flush = await flushHealthSamples();
          await load();
          if (!flush) {
            setLastFlushSummary(
              "همگام‌سازی در این پلتفرم پشتیبانی نمی‌شود.",
            );
            return;
          }
          if (flush.mode === "stub_empty") {
            setLastFlushSummary(
              "نمونهٔ دستگاه خوانده نشد (مسیر stub)؛ lastSyncAt به‌روز شد.",
            );
          } else {
            setLastFlushSummary(
              `${flush.sampleCount} نمونه · ${flush.created} جدید · ${flush.deduplicated} تکراری`,
            );
          }
        } catch (error) {
          setLastFlushSummary(
            error instanceof Error ? error.message : "همگام‌سازی ناموفق بود.",
          );
        } finally {
          setPending(false);
        }
      }}
      pending={pending}
      platform={health.platform}
      syncStates={syncStates}
    />
  );
}
