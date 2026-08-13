"use client";

import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { parseMemberImportCsv } from "../../lib/member-import-csv";
import type {
  OwnerMember,
  OwnerMembershipState,
} from "../../lib/owner-members-data";
import { ownerMembersScreenStyles as styles } from "./OwnerMembersScreen.styles";
import type {
  OwnerMembersFilterId,
  OwnerMembersScreenProps,
} from "./OwnerMembersScreen.types";

const STATE_CHIP_COLOR: Record<
  OwnerMembershipState,
  "success" | "warning" | "accent" | "danger"
> = {
  active: "success",
  expiring: "warning",
  frozen: "accent",
  expired: "danger",
};

const STATE_LABEL_KEY = {
  active: "stateActive",
  expiring: "stateExpiring",
  frozen: "stateFrozen",
  expired: "stateExpired",
} as const;

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

export function OwnerMembersScreen({
  members,
  stats,
  className,
  plans = [],
  pending = false,
  onCheckIn,
  onFreeze,
  onUnfreeze,
  onSell,
  onImport,
}: OwnerMembersScreenProps) {
  const t = useTranslations("OwnerMembers");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<OwnerMembersFilterId>("all");
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [sellPlanId, setSellPlanId] = useState("");
  const [sellName, setSellName] = useState("");
  const [sellPhone, setSellPhone] = useState("");
  const [sellChannel, setSellChannel] = useState<
    "cash" | "pos" | "card_to_card" | "mixed"
  >("cash");
  const [sellPaidAmount, setSellPaidAmount] = useState("");
  const [sellExternalRef, setSellExternalRef] = useState("");
  const [cashTender, setCashTender] = useState("");
  const [posTender, setPosTender] = useState("");
  const [cardTender, setCardTender] = useState("");
  const [debtDueAt, setDebtDueAt] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
  });
  const [installmentCount, setInstallmentCount] = useState("1");
  const [importRows, setImportRows] = useState<
    ReturnType<typeof parseMemberImportCsv>
  >([]);
  const [importSummary, setImportSummary] = useState<{
    valid: number;
    imported: number;
    skipped: number;
    error: number;
  } | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importPending, setImportPending] = useState(false);
  const saleAttemptKey = useRef<string | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === sellPlanId);
  const planAmount = selectedPlan?.pricing.amount ?? 0;
  const collectedAmount = sellPaidAmount.trim()
    ? Number(sellPaidAmount)
    : planAmount;
  const mixedTenders = [
    { channel: "cash" as const, amount: Number(cashTender) },
    { channel: "pos" as const, amount: Number(posTender) },
    { channel: "card_to_card" as const, amount: Number(cardTender) },
  ].filter((tender) => Number.isFinite(tender.amount) && tender.amount > 0);
  const mixedIsValid =
    sellChannel !== "mixed" ||
    (mixedTenders.length >= 2 &&
      mixedTenders.reduce((sum, tender) => sum + tender.amount, 0) ===
        collectedAmount);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim();

    return members.filter((member) => {
      if (activeFilter !== "all" && member.membershipState !== activeFilter) {
        return false;
      }
      if (normalizedQuery && !member.name.includes(normalizedQuery)) {
        return false;
      }
      return true;
    });
  }, [members, query, activeFilter]);

  const toggleCheckIn = async (member: OwnerMember) => {
    if (checkedInIds.has(member.id) || pendingId) return;
    if (onCheckIn) {
      setPendingId(member.id);
      try {
        await onCheckIn(member);
        setCheckedInIds((previous) => new Set(previous).add(member.id));
      } catch {
        // Keep UI unchanged on failure; gate may toast later.
      } finally {
        setPendingId(null);
      }
      return;
    }
    setCheckedInIds((previous) => new Set(previous).add(member.id));
  };

  const submitSale = async () => {
    if (!onSell || !selectedPlan) return;
    const key =
      saleAttemptKey.current ??
      `desk-membership:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
    saleAttemptKey.current = key;
    await onSell({
      planId: selectedPlan.id,
      guestName: sellName.trim(),
      guestPhone: sellPhone.trim(),
      idempotencyKey: key,
      channel: sellChannel,
      paidAmount:
        sellPaidAmount.trim() && Number.isFinite(collectedAmount)
          ? collectedAmount
          : undefined,
      externalRef: sellExternalRef.trim() || undefined,
      tenders: sellChannel === "mixed" ? mixedTenders : undefined,
      debt:
        collectedAmount < planAmount
          ? {
              dueAt: new Date(`${debtDueAt}T23:59:59+03:30`).toISOString(),
              installmentCount: Math.max(1, Number(installmentCount) || 1),
            }
          : undefined,
    });
    saleAttemptKey.current = null;
    setSellName("");
    setSellPhone("");
    setSellPaidAmount("");
    setSellExternalRef("");
    setCashTender("");
    setPosTender("");
    setCardTender("");
  };

  const validateImportFile = async (file: File) => {
    if (!onImport) return;
    setImportPending(true);
    setImportMessage(null);
    try {
      const rows = parseMemberImportCsv(await file.text());
      setImportRows(rows);
      const result = await onImport(rows, sellPlanId || undefined, true);
      setImportSummary(result.summary);
    } catch (error) {
      setImportRows([]);
      setImportSummary(null);
      setImportMessage(
        error instanceof Error ? error.message : t("importError"),
      );
    } finally {
      setImportPending(false);
    }
  };

  const commitImport = async () => {
    if (!onImport || importRows.length === 0) return;
    setImportPending(true);
    setImportMessage(null);
    try {
      const result = await onImport(importRows, sellPlanId || undefined, false);
      setImportSummary(result.summary);
      setImportMessage(t("importDone"));
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : t("importError"),
      );
    } finally {
      setImportPending(false);
    }
  };

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
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
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
          <Typography className={styles.introCount} type="body-sm">
            {t("totalCount", { count: members.length })}
          </Typography>
        </section>

        <div className={styles.statsGrid}>
          <StatsCard
            chart="line"
            color={stats.activeColor}
            comparisonSeries={stats.activeComparisonSeries}
            series={stats.activeSeries}
            title={t("statActiveTitle")}
            unit={t("statActiveUnit")}
            value={stats.activeValue}
          />
          <StatsCard
            chart="bar"
            color={stats.weekColor}
            series={stats.weekSeries}
            title={t("statWeekTitle")}
            unit={t("statWeekUnit")}
            value={stats.weekValue}
          />
        </div>

        {onSell && plans.length > 0 ? (
          <section className={styles.groupCard}>
            <div className="flex flex-col gap-3 p-4">
              <Typography type="body" weight="semibold">
                {t("sellTitle")}
              </Typography>
              <TextField>
                <Label>{t("sellPlanLabel")}</Label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  onChange={(event) => setSellPlanId(event.target.value)}
                  value={sellPlanId}
                >
                  <option value="">—</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </TextField>
              {selectedPlan ? (
                <Typography type="body-sm">
                  {t("sellPlanPrice", {
                    amount: selectedPlan.pricing.amount.toLocaleString("fa-IR"),
                  })}
                </Typography>
              ) : null}
              <TextField>
                <Label>{t("sellNameLabel")}</Label>
                <Input
                  onChange={(event) => setSellName(event.target.value)}
                  value={sellName}
                />
              </TextField>
              <TextField>
                <Label>{t("sellPhoneLabel")}</Label>
                <Input
                  onChange={(event) => setSellPhone(event.target.value)}
                  value={sellPhone}
                />
              </TextField>
              <TextField>
                <Label>{t("sellChannelLabel")}</Label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  onChange={(event) =>
                    setSellChannel(event.target.value as typeof sellChannel)
                  }
                  value={sellChannel}
                >
                  <option value="cash">{t("channelCash")}</option>
                  <option value="pos">{t("channelPos")}</option>
                  <option value="card_to_card">{t("channelCard")}</option>
                  <option value="mixed">{t("channelMixed")}</option>
                </select>
              </TextField>
              <TextField>
                <Label>{t("sellPaidAmountLabel")}</Label>
                <Input
                  inputMode="numeric"
                  onChange={(event) => setSellPaidAmount(event.target.value)}
                  placeholder={planAmount ? String(planAmount) : undefined}
                  value={sellPaidAmount}
                />
              </TextField>
              {sellChannel === "mixed" ? (
                <div className="grid grid-cols-3 gap-2">
                  <TextField>
                    <Label>{t("channelCash")}</Label>
                    <Input
                      inputMode="numeric"
                      onChange={(event) => setCashTender(event.target.value)}
                      value={cashTender}
                    />
                  </TextField>
                  <TextField>
                    <Label>{t("channelPos")}</Label>
                    <Input
                      inputMode="numeric"
                      onChange={(event) => setPosTender(event.target.value)}
                      value={posTender}
                    />
                  </TextField>
                  <TextField>
                    <Label>{t("channelCard")}</Label>
                    <Input
                      inputMode="numeric"
                      onChange={(event) => setCardTender(event.target.value)}
                      value={cardTender}
                    />
                  </TextField>
                </div>
              ) : null}
              <TextField>
                <Label>{t("sellReferenceLabel")}</Label>
                <Input
                  onChange={(event) => setSellExternalRef(event.target.value)}
                  value={sellExternalRef}
                />
              </TextField>
              {collectedAmount < planAmount ? (
                <div className="grid grid-cols-2 gap-2">
                  <TextField>
                    <Label>{t("debtDueLabel")}</Label>
                    <Input
                      onChange={(event) => setDebtDueAt(event.target.value)}
                      type="date"
                      value={debtDueAt}
                    />
                  </TextField>
                  <TextField>
                    <Label>{t("installmentCountLabel")}</Label>
                    <Input
                      inputMode="numeric"
                      onChange={(event) =>
                        setInstallmentCount(event.target.value)
                      }
                      value={installmentCount}
                    />
                  </TextField>
                </div>
              ) : null}
              <Button
                isDisabled={
                  pending ||
                  !sellPlanId ||
                  !sellName.trim() ||
                  !sellPhone.trim() ||
                  !Number.isFinite(collectedAmount) ||
                  collectedAmount < 0 ||
                  collectedAmount > planAmount ||
                  !mixedIsValid
                }
                onPress={() => void submitSale()}
                variant="primary"
              >
                {t("sellSubmit")}
              </Button>
            </div>
          </section>
        ) : null}

        {onImport && plans.length > 0 ? (
          <section className={styles.groupCard}>
            <div className="flex flex-col gap-3 p-4">
              <Typography type="body" weight="semibold">
                {t("importTitle")}
              </Typography>
              <Typography type="body-sm">{t("importHint")}</Typography>
              <input
                accept=".csv,text/csv"
                disabled={importPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void validateImportFile(file);
                }}
                type="file"
              />
              {importSummary ? (
                <Typography type="body-sm">
                  {t("importSummary", importSummary)}
                </Typography>
              ) : null}
              {importMessage ? (
                <Typography type="body-sm">{importMessage}</Typography>
              ) : null}
              <Button
                isDisabled={
                  importPending ||
                  importRows.length === 0 ||
                  !sellPlanId ||
                  Boolean(importSummary?.error)
                }
                isPending={importPending}
                onPress={() => void commitImport()}
                variant="secondary"
              >
                {t("importCommit")}
              </Button>
            </div>
          </section>
        ) : null}

        <TextField className={styles.search}>
          <Label>{t("searchLabel")}</Label>
          <Input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            value={query}
          />
        </TextField>

        <FilterChipBar aria-label={t("filtersLabel")}>
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              selected={activeFilter === filter.id}
            >
              {t(filter.labelKey)}
            </FilterChip>
          ))}
        </FilterChipBar>

        {filteredMembers.length > 0 ? (
          <div aria-label={t("listLabel")} className={styles.groupCard}>
            {filteredMembers.map((member, index) => {
              const isCheckedIn = checkedInIds.has(member.id);
              const fillPercent = Math.min(
                Math.round((member.sessionsUsed / member.sessionsTotal) * 100),
                100,
              );

              return (
                <div key={member.id}>
                  <div className={styles.row}>
                    <Image
                      alt={member.name}
                      className={styles.avatar}
                      height={44}
                      src={member.avatar}
                      width={44}
                    />
                    <div className={styles.rowBody}>
                      <div className={styles.rowTop}>
                        <Typography
                          className={styles.rowName}
                          type="body"
                          weight="semibold"
                        >
                          {member.name}
                        </Typography>
                        <Chip
                          color={STATE_CHIP_COLOR[member.membershipState]}
                          size="sm"
                          variant="soft"
                        >
                          <Chip.Label>
                            {t(STATE_LABEL_KEY[member.membershipState])}
                          </Chip.Label>
                        </Chip>
                        {isCheckedIn ? (
                          <Chip color="success" size="sm" variant="soft">
                            <Chip.Label>{t("checkedInChip")}</Chip.Label>
                          </Chip>
                        ) : null}
                      </div>
                      <Typography className={styles.rowPlan} type="body-sm">
                        {member.planName}
                      </Typography>
                      <Typography className={styles.rowMeta} type="body-sm">
                        {member.lastCheckInLabel}
                      </Typography>
                      <div className={styles.progress}>
                        <div className={styles.progressRow}>
                          <Typography
                            className={styles.progressLabel}
                            type="body-sm"
                          >
                            {t("sessionsLabel")}
                          </Typography>
                          <span className={styles.progressValue}>
                            {member.sessionsUsed}/{member.sessionsTotal}
                          </span>
                        </div>
                        <span aria-hidden className={styles.progressTrack}>
                          <span
                            className={styles.progressFill}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </span>
                      </div>
                    </div>
                    <div className={styles.rowEnd}>
                      <Button
                        aria-label={t("checkInAction", { name: member.name })}
                        isDisabled={Boolean(pendingId) || pending}
                        isIconOnly
                        onPress={() => {
                          void toggleCheckIn(member);
                        }}
                        size="lg"
                        variant="ghost"
                      >
                        <CheckCircle
                          className={
                            isCheckedIn ? "text-success" : "text-muted"
                          }
                          size={22}
                        />
                      </Button>
                      {member.membershipState === "frozen" && onUnfreeze ? (
                        <Button
                          isDisabled={pending}
                          onPress={() => {
                            void onUnfreeze(member);
                          }}
                          size="sm"
                          variant="secondary"
                        >
                          {t("unfreezeAction")}
                        </Button>
                      ) : null}
                      {member.membershipState !== "frozen" &&
                      member.membershipState !== "expired" &&
                      onFreeze ? (
                        <Button
                          isDisabled={pending}
                          onPress={() => {
                            void onFreeze(member);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          {t("freezeAction")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {index < filteredMembers.length - 1 ? (
                    <div aria-hidden className={styles.divider} />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <Typography
              className={styles.emptyTitle}
              type="h4"
              weight="semibold"
            >
              {t("emptyTitle")}
            </Typography>
            <Typography className={styles.emptyBody} type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
