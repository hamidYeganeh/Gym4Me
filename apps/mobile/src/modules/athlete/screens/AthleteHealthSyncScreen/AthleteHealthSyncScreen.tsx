"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { HealthSyncState } from "@repo/api";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useRouter } from "@/shared/lib/app-router";

import { athleteHealthSyncScreenVariants } from "./AthleteHealthSyncScreen.styles";
import type { AthleteHealthSyncScreenProps } from "./AthleteHealthSyncScreen.types";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tehran",
  }).format(new Date(value));
}

function statusLabel(status: HealthSyncState["status"]) {
  switch (status) {
    case "connected":
      return "متصل";
    case "syncing":
      return "در حال همگام‌سازی";
    case "synced":
      return "همگام‌شده";
    case "partial":
      return "نیازمند بررسی";
    case "paused":
      return "متوقف";
    case "disconnected":
      return "قطع‌شده";
    case "error":
      return "خطا";
    default:
      return status;
  }
}

export function AthleteHealthSyncScreen({
  syncStates,
  connectStatus,
  platform,
  pending = false,
  lastFlushSummary,
  queueSummary,
  onConnect,
  onSync,
  onDisconnect,
  onRecoverQueue,
  onOpenSettings,
}: AthleteHealthSyncScreenProps) {
  const router = useRouter();
  const styles = athleteHealthSyncScreenVariants();
  const active = syncStates.find(
    (item) => item.status !== "disconnected",
  );
  const needsRecovery =
    (queueSummary?.poison ?? 0) > 0 || (queueSummary?.rejected ?? 0) > 0;

  return (
    <AppLayout
      className={styles.root()}
      header={
        <SecondaryPageHeader
          backAriaLabel="بازگشت"
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography type="h1" weight="bold">
            همگام‌سازی سلامت
          </Typography>
          <Typography className={styles.subtitle()} type="body">
            اتصال به Apple Health یا Health Connect. قطع اتصال داده‌های قبلی را
            حذف نمی‌کند.
          </Typography>
        </section>

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            وضعیت دستگاه
          </Typography>
          <Typography className={styles.meta()} type="body-sm">
            پلتفرم: {platform} · وضعیت اتصال: {connectStatus}
          </Typography>
          {queueSummary ? (
            <Typography className={styles.meta()} type="body-sm">
              صف آفلاین: {queueSummary.pending} در انتظار
              {queueSummary.retryable > 0
                ? ` · ${queueSummary.retryable} تلاش دوباره`
                : ""}
              {queueSummary.poison > 0
                ? ` · ${queueSummary.poison} نیازمند بازیابی`
                : ""}
              {queueSummary.rejected > 0
                ? ` · ${queueSummary.rejected} ردشده`
                : ""}
            </Typography>
          ) : null}
          <div className={styles.actions()}>
            <Button
              fullWidth
              isDisabled={pending}
              onPress={() => void onConnect()}
              variant="primary"
            >
              اتصال / مجوز
            </Button>
            <Button
              fullWidth
              isDisabled={pending}
              onPress={() => void onSync()}
              variant="secondary"
            >
              همگام‌سازی الان
            </Button>
            {needsRecovery && onRecoverQueue ? (
              <Button
                fullWidth
                isDisabled={pending}
                onPress={() => void onRecoverQueue()}
                variant="tertiary"
              >
                بازیابی صف خراب
              </Button>
            ) : null}
            {active ? (
              <Button
                fullWidth
                isDisabled={pending}
                onPress={() => void onDisconnect(active.provider)}
                variant="danger"
              >
                قطع اتصال ({active.provider})
              </Button>
            ) : null}
            {onOpenSettings ? (
              <Button
                fullWidth
                isDisabled={pending}
                onPress={() => void onOpenSettings()}
                variant="tertiary"
              >
                تنظیمات Health Connect
              </Button>
            ) : null}
          </div>
          {lastFlushSummary ? (
            <Typography className={styles.feedback()} type="body-sm">
              {lastFlushSummary}
            </Typography>
          ) : null}
        </section>

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            وضعیت همگام‌سازی سمت سرور
          </Typography>
          {syncStates.length === 0 ? (
            <div className={styles.empty()}>هنوز ارائه‌دهنده‌ای ثبت نشده است.</div>
          ) : (
            <div className={styles.list()}>
              {syncStates.map((state) => (
                <article className={styles.row()} key={state.id}>
                  <div className={styles.rowTop()}>
                    <Typography type="body" weight="semibold">
                      {state.provider}
                    </Typography>
                    <Chip
                      color={
                        state.status === "connected" || state.status === "synced"
                          ? "success"
                          : state.status === "error" ||
                              state.status === "partial"
                            ? "danger"
                            : "default"
                      }
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>{statusLabel(state.status)}</Chip.Label>
                    </Chip>
                  </div>
                  <Typography className={styles.meta()} type="body-sm">
                    آخرین موفقیت: {formatDate(state.lastSyncAt)}
                  </Typography>
                  <Typography className={styles.meta()} type="body-sm">
                    متریک‌های مجاز:{" "}
                    {state.authorizedMetricKeys.length
                      ? state.authorizedMetricKeys.join(" · ")
                      : "—"}
                  </Typography>
                  {state.lastErrorCode ? (
                    <Typography className={styles.error()} type="body-sm">
                      خطا: {state.lastErrorCode}
                    </Typography>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
