"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { HealthSyncProvider, HealthSyncState } from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import {
  disconnectHealthProvider,
  flushHealthSamples,
  resolveHealthProvider,
  retryPoisonHealthSyncItems,
  summarizeHealthSyncQueue,
  upsertConnectedHealthState,
  useHealthMetricsConnect,
  type HealthSyncQueueSummary,
} from "@/shared/lib/health";
import { accountProgress } from "@/shared/lib/api";
import { useFeatureFlag } from "@/shared/providers/AppConfigProvider";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteHealthSyncScreen } from "../screens/AthleteHealthSyncScreen";

export function AthleteHealthSyncGate() {
  const { isAuthenticated, isReady, user } = useAuth();
  const userId = user?.id ?? null;
  const deviceSyncEnabled = useFeatureFlag("health.device_sync");
  const health = useHealthMetricsConnect();
  const [syncStates, setSyncStates] = useState<HealthSyncState[] | null>(null);
  const [queueSummary, setQueueSummary] =
    useState<HealthSyncQueueSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lastFlushSummary, setLastFlushSummary] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    if (!userId) {
      setQueueSummary(null);
      return;
    }
    setQueueSummary(await summarizeHealthSyncQueue(userId));
  }, [userId]);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setSyncStates([]);
      setQueueSummary(null);
      return;
    }
    try {
      const result = await accountProgress.listHealthSyncStates();
      setSyncStates(result.items);
      await loadQueue();
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "بارگذاری اتصال‌ها ناموفق بود.",
      );
      throw error;
    }
  }, [isAuthenticated, loadQueue]);

  useEffect(() => {
    if (!isReady || !deviceSyncEnabled) return;
    void load().catch(() => undefined);
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
    if (loadError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <Typography type="h3" weight="semibold">
            بارگذاری اتصال‌های سلامت ناموفق بود
          </Typography>
          <Typography className="text-muted" type="body">
            {loadError}
          </Typography>
          <Button
            onPress={() => void load().catch(() => undefined)}
            variant="tertiary"
          >
            تلاش دوباره
          </Button>
        </div>
      );
    }
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
        if (!userId) {
          setLastFlushSummary("برای اتصال باید وارد حساب شوید.");
          return;
        }
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
                userId,
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
          await disconnectHealthProvider(provider, {
            userId: userId ?? undefined,
          });
          await load();
          setLastFlushSummary(
            "اتصال قطع شد؛ صف ارسال‌نشده پاک شد و نمونه‌های قبلی روی سرور حذف نشدند.",
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
      onRecoverQueue={async () => {
        if (!userId) return;
        setPending(true);
        try {
          const recovered = await retryPoisonHealthSyncItems({ userId });
          const provider = resolveHealthProvider(health.platform);
          if (provider && health.authorization && health.isConnected) {
            const currentState = syncStates.find(
              (state) => state.provider === provider,
            );
            const flush = await flushHealthSamples({
              userId,
              provider,
              authorization: health.authorization,
              cursorByMetric: currentState?.cursorByMetric,
            });
            await load();
            setLastFlushSummary(
              `بازیابی ${recovered} مورد · صف باقی‌مانده ${flush.queue.pending}`,
            );
            return;
          }
          await loadQueue();
          setLastFlushSummary(
            recovered > 0
              ? `${recovered} مورد برای تلاش دوباره آماده شد.`
              : "موردی برای بازیابی نبود.",
          );
        } catch (error) {
          setLastFlushSummary(
            error instanceof Error ? error.message : "بازیابی صف ناموفق بود.",
          );
        } finally {
          setPending(false);
        }
      }}
      onSync={async () => {
        setPending(true);
        setLastFlushSummary(null);
        try {
          if (!userId) {
            setLastFlushSummary("برای همگام‌سازی باید وارد حساب شوید.");
            return;
          }
          const provider = resolveHealthProvider(health.platform);
          if (!provider || !health.authorization || !health.isConnected) {
            setLastFlushSummary(
              "برای همگام‌سازی ابتدا دسترسی دادهٔ سلامت را متصل کنید.",
            );
            return;
          }
          const currentState = syncStates.find(
            (state) => state.provider === provider,
          );
          const flush = await flushHealthSamples({
            userId,
            provider,
            authorization: health.authorization,
            cursorByMetric: currentState?.cursorByMetric,
          });
          await load();
          if (flush.rejected > 0) {
            setLastFlushSummary(
              `${flush.sampleCount} نمونه خوانده شد؛ ${flush.rejected} مورد رد شد. موارد پذیرفته‌شده از صف حذف شدند.`,
            );
            return;
          }
          if (flush.queue.pending > 0 || flush.queue.retryable > 0) {
            setLastFlushSummary(
              `${flush.created} ذخیره شد · ${flush.queue.pending} در صف برای تلاش دوباره.`,
            );
            return;
          }
          setLastFlushSummary(
            `${flush.sampleCount} نمونه · ${flush.created} جدید · ${flush.deduplicated} تکراری`,
          );
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
      queueSummary={queueSummary}
      syncStates={syncStates}
    />
  );
}
