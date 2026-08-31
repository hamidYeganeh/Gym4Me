"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { ConsentHistoryEvent } from "@repo/api";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useRouter } from "@/shared/lib/app-router";
import { useTranslations } from "next-intl";

import { useState } from "react";
import { athleteDataRightsScreenVariants } from "./AthleteDataRightsScreen.styles";
import type { AthleteDataRightsScreenProps } from "./AthleteDataRightsScreen.types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function eventTypeLabel(type: ConsentHistoryEvent["type"]) {
  switch (type) {
    case "granted":
      return "اعطا";
    case "revoked":
      return "لغو";
    case "expired":
      return "انقضا";
    default:
      return type;
  }
}

export function AthleteDataRightsScreen({
  consentEvents,
  pending = false,
  lastExportSummary,
  onExport,
  onDeleteMetrics,
  deletionRequest,
  onRequestAccountDeletion,
  onCancelAccountDeletion,
}: AthleteDataRightsScreenProps) {
  const t = useTranslations("AthleteDataRights");
  const router = useRouter();
  const styles = athleteDataRightsScreenVariants();
  const [confirmText, setConfirmText] = useState("");
  const [accountConfirmText, setAccountConfirmText] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setMessage(null);
    setError(null);
    try {
      await onExport();
      setMessage("خروجی داده آماده شد و دانلود آغاز شد.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "خروجی‌گیری ناموفق بود.",
      );
    }
  }

  async function handleDelete() {
    if (confirmText !== "DELETE_METRICS") {
      setError("برای تأیید، عبارت DELETE_METRICS را وارد کن.");
      return;
    }
    setMessage(null);
    setError(null);
    try {
      const result = await onDeleteMetrics();
      setConfirmText("");
      setMessage(`${result.deletedCount} متریک حذف شد.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "حذف ناموفق بود.");
    }
  }

  async function handleAccountDeletion() {
    if (accountConfirmText !== "DELETE_ACCOUNT") {
      setError(t("accountConfirmationError"));
      return;
    }
    setMessage(null);
    setError(null);
    try {
      await onRequestAccountDeletion(deletionReason.trim() || undefined);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("accountRequestError"),
      );
    }
  }

  async function handleCancelAccountDeletion() {
    setMessage(null);
    setError(null);
    try {
      await onCancelAccountDeletion();
      setMessage(t("accountCancelSuccess"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("accountCancelError"),
      );
    }
  }

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
        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            خروجی داده
          </Typography>
          <Button size="lg"
            fullWidth
            isDisabled={pending}
            onPress={() => void handleExport()}
            variant="primary"
          >
            دریافت خروجی JSON
          </Button>
          {lastExportSummary ? (
            <Typography className={styles.feedback()} type="body-sm">
              {lastExportSummary}
            </Typography>
          ) : null}
        </section>

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            {t("accountDeletionTitle")}
          </Typography>
          {deletionRequest?.status === "cooling_off" ? (
            <>
              <Typography className={styles.meta()} type="body-sm">
                {t("accountCoolingOff", {
                  date: formatDate(deletionRequest.coolingOffUntil),
                })}
              </Typography>
              <Button size="lg"
                fullWidth
                isDisabled={pending}
                onPress={() => void handleCancelAccountDeletion()}
                variant="secondary"
              >
                {t("accountCancel")}
              </Button>
            </>
          ) : (
            <>
              <Typography className={styles.meta()} type="body-sm">
                {t("accountDeletionBody")}
              </Typography>
              <TextField>
                <Label>{t("accountReasonLabel")}</Label>
                <Input
                  onChange={(event) => setDeletionReason(event.target.value)}
                  value={deletionReason}
                />
              </TextField>
              <TextField>
                <Label>{t("accountConfirmationLabel")}</Label>
                <Input
                  autoCapitalize="characters"
                  onChange={(event) =>
                    setAccountConfirmText(event.target.value.trim())
                  }
                  placeholder="DELETE_ACCOUNT"
                  value={accountConfirmText}
                />
              </TextField>
              <Button size="lg"
                fullWidth
                isDisabled={pending || accountConfirmText !== "DELETE_ACCOUNT"}
                onPress={() => void handleAccountDeletion()}
                variant="danger"
              >
                {t("accountRequest")}
              </Button>
            </>
          )}
        </section>

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            حذف متریک‌ها
          </Typography>
          <Typography className={styles.meta()} type="body-sm">
            برای تأیید، عبارت DELETE_METRICS را بنویس. نمونه‌های سلامت تا حذف
            صریح باقی می‌مانند.
          </Typography>
          <TextField>
            <Label>عبارت تأیید</Label>
            <Input
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="DELETE_METRICS"
              value={confirmText}
            />
          </TextField>
          <Button size="lg"
            fullWidth
            isDisabled={pending || confirmText !== "DELETE_METRICS"}
            onPress={() => void handleDelete()}
            variant="danger"
          >
            حذف همه متریک‌ها
          </Button>
        </section>

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            تاریخچه رضایت / دسترسی
          </Typography>
          {consentEvents.length === 0 ? (
            <div className={styles.empty()}>رویدادی ثبت نشده است.</div>
          ) : (
            <div className={styles.list()}>
              {consentEvents.map((event) => (
                <article
                  className={styles.row()}
                  key={`${event.grantId}-${event.type}-${event.occurredAt}`}
                >
                  <div className={styles.rowTop()}>
                    <Typography type="body" weight="semibold">
                      {eventTypeLabel(event.type)} · مربی{" "}
                      {event.granteeUserId.slice(-6)}
                    </Typography>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{event.status}</Chip.Label>
                    </Chip>
                  </div>
                  <Typography className={styles.meta()} type="body-sm">
                    {formatDate(event.occurredAt)}
                  </Typography>
                  <Typography className={styles.meta()} type="body-sm">
                    {event.scopes.join(" · ")}
                  </Typography>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className={styles.links()}>
          <Button
            onPress={() => router.push("/athlete/data-grants")}
            size="lg"
            variant="secondary"
          >
            مدیریت دسترسی مربی
          </Button>
        </div>

        {message ? (
          <Typography className={styles.feedback()} type="body-sm">
            {message}
          </Typography>
        ) : null}
        {error ? (
          <Typography className={styles.error()} type="body-sm">
            {error}
          </Typography>
        ) : null}
      </div>
    </AppLayout>
  );
}
