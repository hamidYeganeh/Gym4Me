"use client";

import { useMemo, useRef, useState } from "react";
import { parseMemberImportCsv } from "@/modules/owner/lib/member-import-csv";
import type { OwnerMember } from "@/modules/owner/lib/owner-members-data";
import type {
  OwnerMembersFilterId,
  OwnerMembersScreenProps,
} from "@/modules/owner/screens/OwnerMembersScreen/OwnerMembersScreen.types";

export function useOwnerMembersScreen({
  members,
  onCheckIn,
  onSell,
  onImport,
  plans = [],
}: Pick<
  OwnerMembersScreenProps,
  "members" | "onCheckIn" | "onSell" | "onImport" | "plans"
>) {
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
        // Keep UI unchanged on failure.
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

  const validateImportFile = async (file: File, importErrorLabel: string) => {
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
        error instanceof Error ? error.message : importErrorLabel,
      );
    } finally {
      setImportPending(false);
    }
  };

  const commitImport = async (importErrorLabel: string, importDoneLabel: string) => {
    if (!onImport || importRows.length === 0) return;
    setImportPending(true);
    setImportMessage(null);
    try {
      const result = await onImport(importRows, sellPlanId || undefined, false);
      setImportSummary(result.summary);
      setImportMessage(importDoneLabel);
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : importErrorLabel,
      );
    } finally {
      setImportPending(false);
    }
  };

  const sellDisabled =
    !sellPlanId ||
    !sellName.trim() ||
    !sellPhone.trim() ||
    !Number.isFinite(collectedAmount) ||
    collectedAmount < 0 ||
    collectedAmount > planAmount ||
    !mixedIsValid;

  return {
    query,
    setQuery,
    activeFilter,
    setActiveFilter,
    checkedInIds,
    pendingId,
    sellPlanId,
    setSellPlanId,
    sellName,
    setSellName,
    sellPhone,
    setSellPhone,
    sellChannel,
    setSellChannel,
    sellPaidAmount,
    setSellPaidAmount,
    sellExternalRef,
    setSellExternalRef,
    cashTender,
    setCashTender,
    posTender,
    setPosTender,
    cardTender,
    setCardTender,
    debtDueAt,
    setDebtDueAt,
    installmentCount,
    setInstallmentCount,
    importRows,
    importSummary,
    importMessage,
    importPending,
    selectedPlan,
    planAmount,
    collectedAmount,
    mixedIsValid,
    filteredMembers,
    toggleCheckIn,
    submitSale,
    validateImportFile,
    commitImport,
    sellDisabled,
    showSell: Boolean(onSell && plans.length > 0),
    showImport: Boolean(onImport && plans.length > 0),
  };
}

export type UseOwnerMembersScreenReturn = ReturnType<
  typeof useOwnerMembersScreen
>;
