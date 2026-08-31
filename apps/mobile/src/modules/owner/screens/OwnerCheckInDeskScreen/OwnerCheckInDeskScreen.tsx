"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { TextArea } from "@heroui/react/textarea";
import { Typography } from "@heroui/react/typography";
import { Spinner } from "@heroui/react/spinner";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useState } from "react";
import { ownerCheckInDeskScreenVariants } from "./OwnerCheckInDeskScreen.styles";
import type { OwnerCheckInDeskScreenProps } from "./OwnerCheckInDeskScreen.types";

const RECONCILIATION_STATUS_KEY = {
  processing: "status_processing",
  review: "status_review",
  rejected: "status_rejected",
  accepted: "status_accepted",
  dismissed: "status_dismissed",
} as const;

const RECONCILIATION_REASON_KEY = {
  outside_snapshot_window: "reasonOutsideSnapshotWindow",
  ambiguous_eligibility: "reasonAmbiguousEligibility",
  booking_not_snapshot_eligible: "reasonBookingNotEligible",
  membership_not_snapshot_eligible: "reasonMembershipNotEligible",
  membership_identity_incomplete: "reasonMembershipIdentityIncomplete",
  eligibility_identity_missing: "reasonIdentityMissing",
  authoritative_state_conflict: "reasonAuthoritativeConflict",
} as const;

export function OwnerCheckInDeskScreen({
  pending = false,
  message,
  error,
  onSubmit,
  reconciliations = [],
  reconciliationsLoading = false,
  resolutionPendingId,
  onResolve,
  queueSummary,
  onRecoverQueue,
  recoveryPending = false,
  className,
}: OwnerCheckInDeskScreenProps) {
  const t = useTranslations("OwnerCheckInDesk");
  const styles = ownerCheckInDeskScreenVariants();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const formatOccurredAt = (value: string) =>
    new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      timeZone: "Asia/Tehran",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <form
          className={styles.form()}
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = code.trim();
            if (!trimmed) return;
            void Promise.resolve(onSubmit(trimmed)).then(() => setCode(""));
          }}
        >
          <TextField>
            <Label>{t("codeLabel")}</Label>
            <Input
              onChange={(event) => setCode(event.target.value)}
              placeholder={t("codePlaceholder")}
              value={code}
            />
          </TextField>
          <Button
            isDisabled={pending || !code.trim()}
            type="submit"
            variant="primary"
           size="lg">
            {t("submit")}
          </Button>
        </form>

        {message ? (
          <Typography className={styles.success()} type="body-sm">
            {message}
          </Typography>
        ) : null}
        {error ? (
          <Typography className={styles.danger()} type="body-sm">
            {error}
          </Typography>
        ) : null}

        {queueSummary?.needsRecovery ? (
          <section className={styles.section()}>
            <Typography type="h4" weight="semibold">
              {t("recoveryTitle")}
            </Typography>
            <Typography className="mt-2 text-warning" type="body-sm">
              {queueSummary.recoveryReason === "corrupt_state"
                ? t("recoveryCorruptState")
                : queueSummary.recoveryReason === "revoked_device"
                  ? t("recoveryRevokedDevice")
                  : t("recoveryStaleSnapshot")}
            </Typography>
            {onRecoverQueue ? (
              <Button size="lg"
                className="mt-3"
                isDisabled={recoveryPending}
                onPress={() => void onRecoverQueue()}
                variant="secondary"
              >
                {t("recoveryAction")}
              </Button>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="offline-review-title" className={styles.section()}>
          <div className={styles.sectionHeader()}>
            <span className={styles.sectionCopy()}>
              <Typography
                className={styles.sectionTitle()}
                id="offline-review-title"
                type="h4"
                weight="semibold"
              >
                {t("reviewTitle")}
              </Typography>
              <Typography className={styles.sectionHint()} type="body-sm">
                {t("reviewHint")}
              </Typography>
            </span>
            {reconciliationsLoading ? <Spinner size="sm" /> : null}
          </div>

          {!reconciliationsLoading && reconciliations.length === 0 ? (
            <div className={styles.empty()}>{t("reviewEmpty")}</div>
          ) : (
            <div className={styles.reviewList()}>
              {reconciliations.map((reconciliation) => {
                const reason = reasons[reconciliation.id] ?? "";
                const pending = resolutionPendingId === reconciliation.id;
                const processing = reconciliation.status === "processing";
                const identifier =
                  reconciliation.payload.bookingCode ??
                  reconciliation.payload.membershipId ??
                  reconciliation.payload.clientIdempotencyKey;
                return (
                  <article className={styles.reviewCard()} key={reconciliation.id}>
                    <div className={styles.reviewHeader()}>
                      <span className={styles.reviewBody()}>
                        <Typography className={styles.reviewCode()} type="body" weight="semibold">
                          {identifier}
                        </Typography>
                        <Typography className={styles.reviewMeta()} type="body-sm">
                          {formatOccurredAt(reconciliation.payload.occurredAt)}
                        </Typography>
                        {reconciliation.reasonCode || reconciliation.reason ? (
                          <Typography className={styles.reviewReason()} type="body-sm">
                            {t(
                              reconciliation.reasonCode
                                ? RECONCILIATION_REASON_KEY[
                                    reconciliation.reasonCode as keyof typeof RECONCILIATION_REASON_KEY
                                  ] ?? "reasonUnknown"
                                : "reasonUnknown",
                            )}
                          </Typography>
                        ) : null}
                      </span>
                      <Chip
                        color={processing ? "warning" : "danger"}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {t(RECONCILIATION_STATUS_KEY[reconciliation.status])}
                        </Chip.Label>
                      </Chip>
                    </div>

                    {!processing && onResolve ? (
                      <>
                        <TextField>
                          <Label>{t("resolutionReasonLabel")}</Label>
                          <TextArea
                            onChange={(event) =>
                              setReasons((current) => ({
                                ...current,
                                [reconciliation.id]: event.target.value,
                              }))
                            }
                            placeholder={t("resolutionReasonPlaceholder")}
                            value={reason}
                          />
                        </TextField>
                        <div className={styles.reviewActions()}>
                          {reconciliation.status === "review" ? (
                            <Button
                              isDisabled={pending || reason.trim().length < 3}
                              isPending={pending}
                              onPress={() =>
                                void onResolve(reconciliation, "retry", reason.trim())
                              }
                              size="lg"
                              variant="secondary"
                            >
                              {t("retryResolution")}
                            </Button>
                          ) : null}
                          <Button
                            isDisabled={pending || reason.trim().length < 3}
                            isPending={pending}
                            onPress={() =>
                              void onResolve(reconciliation, "dismiss", reason.trim())
                            }
                            size="lg"
                            variant="ghost"
                          >
                            {t("dismissResolution")}
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
