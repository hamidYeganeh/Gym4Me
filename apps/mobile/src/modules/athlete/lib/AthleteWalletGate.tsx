"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { accountFinance } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteWalletScreen } from "../screens/AthleteWalletScreen";
import { mapPaymentsToWalletGroups } from "./api-wallet";
import {
  WALLET_BALANCE_LABEL,
  WALLET_BALANCE_POINTS,
  WALLET_INCOME_SERIES,
  WALLET_SPEND_SERIES,
  WALLET_TRANSACTION_GROUPS,
  type WalletTransactionGroup,
} from "./wallet-data";

/** Default top-up amount in tomans (matches common desk top-up). */
const DEFAULT_TOP_UP_AMOUNT = 500_000;

function formatBalance(balance: number, currency: string): string {
  const formatted = new Intl.NumberFormat("fa-IR").format(balance);
  return currency === "IRT" || currency === "IRR"
    ? `${formatted} تومان`
    : `${formatted} ${currency}`;
}

type WalletView = {
  balanceLabel: string;
  balancePoints: { label: string; value: number }[];
  incomeSeries: number[];
  spendSeries: number[];
  transactionGroups: WalletTransactionGroup[];
};

const EMPTY_WALLET: WalletView = {
  balanceLabel: "۰ تومان",
  balancePoints: [],
  incomeSeries: [],
  spendSeries: [],
  transactionGroups: [],
};

const DEMO_WALLET: WalletView = {
  balanceLabel: WALLET_BALANCE_LABEL,
  balancePoints: WALLET_BALANCE_POINTS,
  incomeSeries: WALLET_INCOME_SERIES,
  spendSeries: WALLET_SPEND_SERIES,
  transactionGroups: WALLET_TRANSACTION_GROUPS,
};

export function AthleteWalletGate() {
  const t = useTranslations("AthleteWallet");
  const { isAuthenticated, isReady } = useAuth();
  const [view, setView] = useState<WalletView | null>(null);
  const [topUpPending, setTopUpPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [overview, paymentsPage] = await Promise.all([
      accountFinance.walletOverview(),
      accountFinance.listPayments({ page_size: 50 }).catch(() => null),
    ]);
    const transactionGroups = paymentsPage
      ? mapPaymentsToWalletGroups(paymentsPage.result)
      : [];
    setView({
      balanceLabel: formatBalance(overview.balance, overview.currency),
      balancePoints: overview.balancePoints,
      incomeSeries: overview.incomeSeries,
      spendSeries: overview.spendSeries,
      transactionGroups,
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setView(DEMO_MODE ? DEMO_WALLET : EMPTY_WALLET);
      return;
    }

    let cancelled = false;
    load().catch(() => {
      if (!cancelled) {
        setView(DEMO_MODE ? DEMO_WALLET : EMPTY_WALLET);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, load]);

  const handleTopUp = useCallback(async () => {
    if (!isAuthenticated) return;
    setTopUpPending(true);
    setActionError(null);
    try {
      await accountFinance.topUpWallet({
        amount: DEFAULT_TOP_UP_AMOUNT,
        channel: "zarinpal",
        idempotencyKey: `wallet-topup:${Date.now()}`,
      });
      await load();
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : t("topUpError"),
      );
    } finally {
      setTopUpPending(false);
    }
  }, [isAuthenticated, load, t]);

  if (!view) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {actionError ? (
        <div className="px-4 pt-2 text-center">
          <Typography className="text-danger" type="body-sm">
            {actionError}
          </Typography>
        </div>
      ) : null}
      <AthleteWalletScreen
        balanceLabel={view.balanceLabel}
        balancePoints={view.balancePoints}
        incomeSeries={view.incomeSeries}
        onTopUp={isAuthenticated ? () => void handleTopUp() : undefined}
        spendSeries={view.spendSeries}
        topUpPending={topUpPending}
        transactionGroups={view.transactionGroups}
      />
    </>
  );
}
