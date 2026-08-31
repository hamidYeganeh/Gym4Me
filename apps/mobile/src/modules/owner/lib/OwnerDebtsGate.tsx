"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type Debt } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatJalaliFullDate, formatTomans } from "@/shared/lib/booking-view";
import { accountClubs, accountFinance } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerDebtsScreen } from "../screens/OwnerDebtsScreen";
import { OWNER_DEBTS, type OwnerDebtEntry } from "./owner-debts-data";

export function OwnerDebtsGate() {
  const t = useTranslations("OwnerDebts");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [debts, setDebts] = useState<OwnerDebtEntry[] | null>(
    DEMO_MODE ? OWNER_DEBTS : null,
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const retryKeys = useRef<Record<string, string>>({});

  const mapDebt = useCallback((debt: Debt): OwnerDebtEntry => {
    const remaining = Math.max(0, debt.principal - debt.paid);
    const overdue =
      debt.status !== "settled" && new Date(debt.dueAt).getTime() < Date.now();
    const memberName =
      debt.holder.guest?.name ??
      debt.holder.guest?.phone ??
      (debt.holder.userId ? `…${debt.holder.userId.slice(-6)}` : "—");
    return {
      id: debt._id,
      memberName,
      amountLabel: formatTomans(debt.principal),
      remainingLabel: formatTomans(remaining),
      dueAtLabel: formatJalaliFullDate(debt.dueAt),
      installmentCount: debt.installments?.length ?? 1,
      status:
        debt.status === "written_off"
          ? "written-off"
          : overdue
            ? "overdue"
            : debt.status,
    };
  }, []);

  const load = useCallback(async () => {
    setError(null);
    const clubs = await accountClubs.list({ page_size: 1 });
    const selectedClubId = clubs.result[0]?.id;
    if (!selectedClubId) {
      setClubId(null);
      setDebts([]);
      return;
    }
    const page = await accountFinance.listDebts(selectedClubId, {
      page_size: 100,
    });
    setClubId(selectedClubId);
    setDebts(page.result.map(mapDebt));
  }, [mapDebt]);

  useEffect(() => {
    if (!isReady || DEMO_MODE) return;
    if (!isAuthenticated || activeRole !== "club_owner") {
      setDebts([]);
      setError(t("unauthorized"));
      return;
    }
    void load().catch((cause: unknown) => {
      setDebts([]);
      setError(cause instanceof ApiError ? cause.message : t("loadError"));
    });
  }, [activeRole, isAuthenticated, isReady, load, t]);

  const handleRecordPayment = async (debt: OwnerDebtEntry) => {
    if (DEMO_MODE) {
      setDebts((previous) =>
        (previous ?? []).map((entry) =>
          entry.id === debt.id
            ? { ...entry, status: "settled", remainingLabel: "۰ تومان" }
            : entry,
        ),
      );
      return;
    }
    if (!clubId || !window.confirm(t("confirmFullPayment"))) return;
    setPendingId(debt.id);
    setError(null);
    retryKeys.current[debt.id] ??= crypto.randomUUID();
    try {
      const current = await accountFinance.getDebt(clubId, debt.id);
      const amount = Math.max(0, current.principal - current.paid);
      if (amount === 0) {
        await load();
        return;
      }
      await accountFinance.recordDebtPayment(clubId, debt.id, {
        amount,
        channel: "cash",
        idempotencyKey: retryKeys.current[debt.id]!,
        operatorNote: t("fullPaymentNote"),
      });
      delete retryKeys.current[debt.id];
      await load();
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : t("paymentError"));
    } finally {
      setPendingId(null);
    }
  };

  if (debts === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner aria-label={t("loading")} size="lg" />
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="flex flex-col items-center gap-2 px-4 pt-3" role="alert">
          <Typography className="text-danger" type="body-sm">
            {error}
          </Typography>
          {isAuthenticated && activeRole === "club_owner" ? (
            <Button onPress={() => void load()} size="lg" variant="secondary">
              {t("retry")}
            </Button>
          ) : null}
        </div>
      ) : null}
      <OwnerDebtsScreen
        debts={debts}
        onRecordPayment={clubId || DEMO_MODE ? handleRecordPayment : undefined}
        pendingId={pendingId}
      />
    </>
  );
}
