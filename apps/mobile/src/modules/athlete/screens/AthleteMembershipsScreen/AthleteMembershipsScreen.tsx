"use client";

import { Button } from "@heroui/react/button";
import { AlertDialog } from "@heroui/react/alert-dialog";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import type { MembershipCheckoutPreview } from "@repo/api";
import { useState } from "react";
import { useRouter } from "@/shared/lib/app-router";

import { athleteMembershipsScreenStyles as styles } from "./AthleteMembershipsScreen.styles";
import type { AthleteMembershipsScreenProps } from "./AthleteMembershipsScreen.types";

export function AthleteMembershipsScreen({
  memberships,
  pending = false,
  onPreviewRenewal,
  onConfirmRenewal,
}: AthleteMembershipsScreenProps) {
  const t = useTranslations("AthleteMemberships");
  const router = useRouter();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalMember, setRenewalMember] = useState<
    (typeof memberships)[number] | null
  >(null);
  const [renewalPreview, setRenewalPreview] =
    useState<MembershipCheckoutPreview | null>(null);
  const [renewalAttemptKey, setRenewalAttemptKey] = useState<string | null>(
    null,
  );
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewalError, setRenewalError] = useState(false);

  const openRenewal = async (membership: (typeof memberships)[number]) => {
    if (!onPreviewRenewal) return;
    setRenewalMember(membership);
    setRenewalPreview(null);
    setRenewalError(false);
    setRenewalAttemptKey(
      `athlete-membership-renewal:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
    );
    setRenewalOpen(true);
    setRenewalLoading(true);
    try {
      setRenewalPreview(await onPreviewRenewal(membership));
    } catch {
      setRenewalError(true);
    } finally {
      setRenewalLoading(false);
    }
  };

  const confirmRenewal = async () => {
    if (
      !onConfirmRenewal ||
      !renewalMember ||
      !renewalPreview ||
      !renewalAttemptKey
    ) {
      return;
    }
    setRenewalError(false);
    try {
      await onConfirmRenewal(
        renewalMember,
        renewalPreview,
        renewalAttemptKey,
      );
    } catch {
      setRenewalError(true);
    }
  };

  const formatPrice = (preview: MembershipCheckoutPreview) => {
    const unit = preview.price.currency === "IRT" ? t("currencyIrt") : preview.price.currency;
    return `${new Intl.NumberFormat("fa-IR").format(preview.price.payable)} ${unit}`;
  };

  const effectLabel = (preview: MembershipCheckoutPreview) => {
    if (typeof preview.resultingCredit.remainingSessions === "number") {
      return t("renewSessionsEffect", {
        count: preview.resultingCredit.remainingSessions,
      });
    }
    if (typeof preview.resultingCredit.remainingEntries === "number") {
      return t("renewEntriesEffect", {
        count: preview.resultingCredit.remainingEntries,
      });
    }
    return t("renewExpiryEffect", {
      date: new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        dateStyle: "long",
        timeZone: "Asia/Tehran",
      }).format(new Date(preview.resultingCredit.expiresAt ?? "")),
    });
  };

  const currentMemberships = memberships.filter(
    (membership) => membership.state !== "expired",
  );
  const pastMemberships = memberships.filter(
    (membership) => membership.state === "expired",
  );

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("activeTitle")}
          </Typography>
          {currentMemberships.length > 0 ? (
            <div className={styles.heroList}>
              {currentMemberships.map((membership) => {
                const progressPercent = Math.round(
                  (membership.sessionsUsed / membership.sessionsTotal) * 100,
                );

                return (
                  <div className={styles.heroCard} key={membership.id}>
                    <div className={styles.heroHeader}>
                      <span className={styles.heroTitles}>
                        <Typography
                          className={styles.heroPlan}
                          type="h4"
                          weight="semibold"
                        >
                          {membership.planName}
                        </Typography>
                        <Typography className={styles.heroClub} type="body-sm">
                          {membership.clubName}
                        </Typography>
                      </span>
                      {membership.state === "expiring" ? (
                        <Chip color="warning" size="sm">
                          <Chip.Label>{t("expiringChip")}</Chip.Label>
                        </Chip>
                      ) : (
                        <Chip color="success" size="sm">
                          <Chip.Label>{t("activeChip")}</Chip.Label>
                        </Chip>
                      )}
                    </div>

                    <div className={styles.progressBlock}>
                      <div className={styles.progressMeta}>
                        <Typography
                          className={styles.progressLabel}
                          type="body-sm"
                        >
                          {t("sessionsProgress", {
                            used: membership.sessionsUsed,
                            total: membership.sessionsTotal,
                          })}
                        </Typography>
                        <Typography
                          className={styles.progressLabel}
                          type="body-sm"
                        >
                          {membership.expiresLabel}
                        </Typography>
                      </div>
                      <div
                        aria-label={t("sessionsProgress", {
                          used: membership.sessionsUsed,
                          total: membership.sessionsTotal,
                        })}
                        aria-valuemax={membership.sessionsTotal}
                        aria-valuemin={0}
                        aria-valuenow={membership.sessionsUsed}
                        className={styles.progressTrack}
                        role="progressbar"
                      >
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className={styles.heroFooter}>
                      <Typography
                        className={styles.price}
                        type="body"
                        weight="semibold"
                      >
                        {membership.priceLabel}
                      </Typography>
                      {onPreviewRenewal &&
                      membership.clubId &&
                      membership.planId ? (
                        <Button
                          isDisabled={pending}
                          onPress={() => {
                            void openRenewal(membership);
                          }}
                          size="sm"
                          variant="primary"
                        >
                          {t("renew")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <Typography className={styles.emptyTitle} type="h4" weight="semibold">
                {t("emptyTitle")}
              </Typography>
              <Typography className={styles.emptyBody} type="body-sm">
                {t("emptyBody")}
              </Typography>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("pastTitle")}
          </Typography>
          {pastMemberships.length > 0 ? (
            <div className={styles.pastList}>
              {pastMemberships.map((membership) => (
                <div className={styles.pastCard} key={membership.id}>
                  <div className={styles.pastHeader}>
                    <span className={styles.pastTitles}>
                      <Typography
                        className={styles.pastPlan}
                        type="body"
                        weight="semibold"
                      >
                        {membership.planName}
                      </Typography>
                      <Typography className={styles.pastMeta} type="body-sm">
                        {membership.clubName}
                      </Typography>
                    </span>
                    <Chip size="sm">
                      <Chip.Label>{t("expiredChip")}</Chip.Label>
                    </Chip>
                  </div>
                  <Typography className={styles.pastMeta} type="body-sm">
                    {membership.expiresLabel}
                  </Typography>
                  {onPreviewRenewal &&
                  membership.clubId &&
                  membership.planId ? (
                    <Button
                      className="mt-2"
                      isDisabled={pending}
                      onPress={() => {
                        void openRenewal(membership);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      {t("purchase")}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <Typography className={styles.emptyBody} type="body-sm">
                {t("emptyPast")}
              </Typography>
            </div>
          )}
        </section>
      </div>

      <AlertDialog>
        <AlertDialog.Backdrop isOpen={renewalOpen} onOpenChange={setRenewalOpen}>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>{t("renewTitle")}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                {renewalLoading ? (
                  <Typography type="body-sm">{t("renewLoading")}</Typography>
                ) : renewalPreview ? (
                  <div className="space-y-3">
                    <Typography type="body-sm">
                      {t("renewPlan", { plan: renewalPreview.plan.name })}
                    </Typography>
                    <Typography type="body" weight="semibold">
                      {formatPrice(renewalPreview)}
                    </Typography>
                    <Typography type="body-sm">
                      {effectLabel(renewalPreview)}
                    </Typography>
                    <Typography className="text-muted" type="body-sm">
                      {t("renewConsent")}
                    </Typography>
                  </div>
                ) : null}
                {renewalError ? (
                  <Typography className="text-danger" type="body-sm">
                    {t("renewError")}
                  </Typography>
                ) : null}
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  {t("renewCancel")}
                </Button>
                <Button
                  isDisabled={!renewalPreview || renewalLoading}
                  isPending={pending}
                  onPress={() => {
                    void confirmRenewal();
                  }}
                  variant="primary"
                >
                  {t("renewPay")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </AppLayout>
  );
}
