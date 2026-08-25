"use client";

import { Button } from "@heroui/react/button";
import { AlertDialog } from "@heroui/react/alert-dialog";
import { Typography } from "@heroui/react/typography";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import type { MembershipRenewalPreview } from "@repo/api";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/shared/lib/app-router";

import { useOwnerMembersScreen } from "@/modules/owner/lib/use-owner-members-screen";
import { OwnerMembersImportSection } from "@/modules/owner/sections/OwnerMembersImportSection";
import { OwnerMembersIntroSection } from "@/modules/owner/sections/OwnerMembersIntroSection";
import { OwnerMembersListSection } from "@/modules/owner/sections/OwnerMembersListSection";
import { OwnerMembersSellSection } from "@/modules/owner/sections/OwnerMembersSellSection";
import { OwnerMembersStatsSection } from "@/modules/owner/sections/OwnerMembersStatsSection";
import { ownerMembersScreenStyles as styles } from "./OwnerMembersScreen.styles";
import type {
  OwnerMembersFilterId,
  OwnerMembersRenewInput,
  OwnerMembersScreenProps,
} from "./OwnerMembersScreen.types";

const FILTERS = [
  { id: "all", labelKey: "filterAll" },
  { id: "active", labelKey: "filterActive" },
  { id: "expiring", labelKey: "filterExpiring" },
  { id: "frozen", labelKey: "filterFrozen" },
  { id: "expired", labelKey: "filterExpired" },
] as const satisfies readonly {
  id: OwnerMembersFilterId;
  labelKey: string;
}[];

const normalizeNumericInput = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

export function OwnerMembersScreen({
  members,
  stats,
  className,
  plans = [],
  pending = false,
  onCheckIn,
  onFreeze,
  onUnfreeze,
  onPreviewRenewal,
  onRenew,
  onSell,
  onImport,
}: OwnerMembersScreenProps) {
  const t = useTranslations("OwnerMembers");
  const router = useRouter();
  const [renewalMember, setRenewalMember] = useState<
    OwnerMembersScreenProps["members"][number] | null
  >(null);
  const [renewalPreview, setRenewalPreview] =
    useState<MembershipRenewalPreview | null>(null);
  const [renewalAttemptKey, setRenewalAttemptKey] = useState<string | null>(
    null,
  );
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalPreviewPending, setRenewalPreviewPending] = useState(false);
  const [renewalError, setRenewalError] = useState(false);
  const [renewalChannel, setRenewalChannel] = useState<
    NonNullable<OwnerMembersRenewInput["channel"]>
  >("cash");
  const [renewalPaidAmount, setRenewalPaidAmount] = useState("");
  const [renewalExternalRef, setRenewalExternalRef] = useState("");
  const [renewalCashTender, setRenewalCashTender] = useState("");
  const [renewalPosTender, setRenewalPosTender] = useState("");
  const [renewalCardTender, setRenewalCardTender] = useState("");
  const desk = useOwnerMembersScreen({
    members,
    onCheckIn,
    onSell,
    onImport,
    plans,
  });

  const previewRenewal = async (
    member: OwnerMembersScreenProps["members"][number],
  ) => {
    if (!onPreviewRenewal) return;
    setRenewalMember(member);
    setRenewalPreview(null);
    setRenewalError(false);
    setRenewalChannel("cash");
    setRenewalPaidAmount("");
    setRenewalExternalRef("");
    setRenewalCashTender("");
    setRenewalPosTender("");
    setRenewalCardTender("");
    setRenewalAttemptKey(
      `membership-renewal:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
    );
    setRenewalOpen(true);
    setRenewalPreviewPending(true);
    try {
      setRenewalPreview(await onPreviewRenewal(member));
    } catch {
      setRenewalError(true);
    } finally {
      setRenewalPreviewPending(false);
    }
  };

  const confirmRenewal = async () => {
    if (!onRenew || !renewalMember || !renewalPreview || !renewalAttemptKey) {
      return;
    }
    setRenewalError(false);
    const payable = renewalPreview.price.payable;
    const paidAmount = renewalPaidAmount.trim()
      ? Number(renewalPaidAmount)
      : payable;
    const tenders = [
      { channel: "cash" as const, amount: Number(renewalCashTender) },
      { channel: "pos" as const, amount: Number(renewalPosTender) },
      { channel: "card_to_card" as const, amount: Number(renewalCardTender) },
    ].filter((tender) => Number.isFinite(tender.amount) && tender.amount > 0);
    try {
      await onRenew(renewalMember, renewalPreview, renewalAttemptKey, {
        channel: renewalChannel,
        paidAmount,
        externalRef: renewalExternalRef.trim() || undefined,
        tenders: renewalChannel === "mixed" ? tenders : undefined,
        debt:
          paidAmount < payable
            ? {
                dueAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
                installmentCount: 1,
              }
            : undefined,
      });
      setRenewalOpen(false);
      setRenewalMember(null);
      setRenewalPreview(null);
      setRenewalAttemptKey(null);
    } catch {
      setRenewalError(true);
    }
  };

  const renewalPayable = renewalPreview?.price.payable ?? 0;
  const renewalCollected = renewalPaidAmount.trim()
    ? Number(renewalPaidAmount)
    : renewalPayable;
  const renewalTenders = [
    Number(renewalCashTender),
    Number(renewalPosTender),
    Number(renewalCardTender),
  ].filter((amount) => Number.isFinite(amount) && amount > 0);
  const renewalPaymentInvalid =
    !Number.isFinite(renewalCollected) ||
    renewalCollected < 0 ||
    renewalCollected > renewalPayable ||
    (renewalChannel === "mixed" &&
      (renewalTenders.length < 2 ||
        renewalTenders.reduce((sum, amount) => sum + amount, 0) !==
          renewalCollected));

  const formatAmount = (amount: number, currency: string) => {
    const unit = currency === "IRT" ? t("currencyIrt") : currency;
    return `${new Intl.NumberFormat("fa-IR").format(amount)} ${unit}`;
  };

  const renewalEffect = (preview: MembershipRenewalPreview) => {
    if (typeof preview.renewedCredit.remainingSessions === "number") {
      return t("renewSessionsEffect", {
        count: preview.renewedCredit.remainingSessions,
      });
    }
    if (typeof preview.renewedCredit.remainingEntries === "number") {
      return t("renewEntriesEffect", {
        count: preview.renewedCredit.remainingEntries,
      });
    }
    return t("renewExpiryEffect", {
      date: new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        dateStyle: "long",
        timeZone: "Asia/Tehran",
      }).format(new Date(preview.renewedCredit.expiresAt ?? "")),
    });
  };

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
          endContent={
            <Button
              onPress={() => router.push("/owner/check-in")}
              size="sm"
              variant="secondary"
            >
              {t("checkInDeskLink")}
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <OwnerMembersIntroSection
          countLabel={t("totalCount", { count: members.length })}
          subtitle={t("subtitle")}
          title={t("title")}
        />

        <OwnerMembersStatsSection
          activeTitle={t("statActiveTitle")}
          activeUnit={t("statActiveUnit")}
          stats={stats}
          weekTitle={t("statWeekTitle")}
          weekUnit={t("statWeekUnit")}
        />

        {desk.showSell ? (
          <OwnerMembersSellSection
            {...desk}
            channelCard={t("channelCard")}
            channelCash={t("channelCash")}
            channelLabel={t("sellChannelLabel")}
            channelMixed={t("channelMixed")}
            channelPos={t("channelPos")}
            debtDueLabel={t("debtDueLabel")}
            installmentCountLabel={t("installmentCountLabel")}
            nameLabel={t("sellNameLabel")}
            paidAmountLabel={t("sellPaidAmountLabel")}
            pending={pending}
            phoneLabel={t("sellPhoneLabel")}
            planLabel={t("sellPlanLabel")}
            planPriceLabel={(values) => t("sellPlanPrice", values)}
            plans={plans}
            referenceLabel={t("sellReferenceLabel")}
            submitLabel={t("sellSubmit")}
            title={t("sellTitle")}
          />
        ) : null}

        {desk.showImport ? (
          <OwnerMembersImportSection
            {...desk}
            commitLabel={t("importCommit")}
            hint={t("importHint")}
            importDoneLabel={t("importDone")}
            importErrorLabel={t("importError")}
            summaryLabel={(values) => t("importSummary", values)}
            title={t("importTitle")}
          />
        ) : null}

        <OwnerMembersListSection
          {...desk}
          checkInAction={(values) => t("checkInAction", values)}
          emptyBody={t("emptyBody")}
          emptyTitle={t("emptyTitle")}
          filters={FILTERS.map((filter) => ({
            id: filter.id,
            label: t(filter.labelKey),
          }))}
          filtersLabel={t("filtersLabel")}
          freezeAction={t("freezeAction")}
          listLabel={t("listLabel")}
          onFreeze={onFreeze}
          onRenew={onPreviewRenewal ? previewRenewal : undefined}
          onUnfreeze={onUnfreeze}
          pending={pending}
          renewAction={t("renewAction")}
          searchLabel={t("searchLabel")}
          searchPlaceholder={t("searchPlaceholder")}
          sessionsLabel={t("sessionsLabel")}
          stateLabels={{
            active: t("stateActive"),
            expiring: t("stateExpiring"),
            frozen: t("stateFrozen"),
            expired: t("stateExpired"),
          }}
          checkedInChip={t("checkedInChip")}
          unfreezeAction={t("unfreezeAction")}
        />
      </div>

      <AlertDialog>
        <AlertDialog.Backdrop isOpen={renewalOpen} onOpenChange={setRenewalOpen}>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>{t("renewTitle")}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                {renewalPreviewPending ? (
                  <Typography type="body-sm">{t("renewLoading")}</Typography>
                ) : renewalPreview ? (
                  <div className="space-y-3">
                    <Typography type="body-sm">
                      {t("renewMemberPlan", {
                        member: renewalMember?.name ?? "",
                        plan: renewalPreview.plan.name,
                      })}
                    </Typography>
                    <Typography type="body-sm" weight="semibold">
                      {formatAmount(
                        renewalPreview.price.payable,
                        renewalPreview.price.currency,
                      )}
                    </Typography>
                    <Typography type="body-sm">
                      {renewalEffect(renewalPreview)}
                    </Typography>
                    <TextField>
                      <Label>{t("renewChannelLabel")}</Label>
                      <select
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                        onChange={(event) =>
                          setRenewalChannel(
                            event.target.value as typeof renewalChannel,
                          )
                        }
                        value={renewalChannel}
                      >
                        <option value="cash">{t("channelCash")}</option>
                        <option value="pos">{t("channelPos")}</option>
                        <option value="card_to_card">{t("channelCard")}</option>
                        <option value="mixed">{t("channelMixed")}</option>
                      </select>
                    </TextField>
                    <TextField>
                      <Label>{t("renewPaidAmountLabel")}</Label>
                      <Input
                        inputMode="numeric"
                        onChange={(event) =>
                          setRenewalPaidAmount(
                            normalizeNumericInput(event.target.value),
                          )
                        }
                        placeholder={String(renewalPreview.price.payable)}
                        value={renewalPaidAmount}
                      />
                    </TextField>
                    {renewalChannel === "mixed" ? (
                      <div className="grid grid-cols-3 gap-2">
                        <TextField>
                          <Label>{t("channelCash")}</Label>
                          <Input
                            inputMode="numeric"
                            onChange={(event) =>
                              setRenewalCashTender(
                                normalizeNumericInput(event.target.value),
                              )
                            }
                            value={renewalCashTender}
                          />
                        </TextField>
                        <TextField>
                          <Label>{t("channelPos")}</Label>
                          <Input
                            inputMode="numeric"
                            onChange={(event) =>
                              setRenewalPosTender(
                                normalizeNumericInput(event.target.value),
                              )
                            }
                            value={renewalPosTender}
                          />
                        </TextField>
                        <TextField>
                          <Label>{t("channelCard")}</Label>
                          <Input
                            inputMode="numeric"
                            onChange={(event) =>
                              setRenewalCardTender(
                                normalizeNumericInput(event.target.value),
                              )
                            }
                            value={renewalCardTender}
                          />
                        </TextField>
                      </div>
                    ) : null}
                    {renewalChannel !== "cash" ? (
                      <TextField>
                        <Label>{t("renewReferenceLabel")}</Label>
                        <Input
                          onChange={(event) =>
                            setRenewalExternalRef(event.target.value)
                          }
                          value={renewalExternalRef}
                        />
                      </TextField>
                    ) : null}
                    {renewalCollected < renewalPayable ? (
                      <Typography className="text-warning" type="body-sm">
                        {t("renewDebtNotice", {
                          amount: formatAmount(
                            renewalPayable - renewalCollected,
                            renewalPreview.price.currency,
                          ),
                        })}
                      </Typography>
                    ) : null}
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
                  isDisabled={
                    !renewalPreview ||
                    renewalPreviewPending ||
                    renewalPaymentInvalid
                  }
                  isPending={pending}
                  onPress={() => {
                    void confirmRenewal();
                  }}
                  variant="primary"
                >
                  {t("renewConfirm")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </AppLayout>
  );
}
