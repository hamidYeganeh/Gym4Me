"use client";

import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import {
  accountFinance,
} from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteWalletScreen } from "../screens/AthleteWalletScreen";
import {
  WALLET_BALANCE_LABEL,
  WALLET_BALANCE_POINTS,
  WALLET_INCOME_SERIES,
  WALLET_SPEND_SERIES,
  WALLET_TRANSACTION_GROUPS,
  type WalletTransactionGroup,
} from "./wallet-data";

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

export function AthleteWalletGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [view, setView] = useState<WalletView | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setView({
        balanceLabel: WALLET_BALANCE_LABEL,
        balancePoints: WALLET_BALANCE_POINTS,
        incomeSeries: WALLET_INCOME_SERIES,
        spendSeries: WALLET_SPEND_SERIES,
        transactionGroups: WALLET_TRANSACTION_GROUPS,
      });
      return;
    }

    let cancelled = false;
    accountFinance
      .walletOverview()
      .then((overview) => {
        if (cancelled) return;
        setView({
          balanceLabel: formatBalance(overview.balance, overview.currency),
          balancePoints:
            overview.balancePoints.length > 0
              ? overview.balancePoints
              : WALLET_BALANCE_POINTS,
          incomeSeries:
            overview.incomeSeries.length > 0
              ? overview.incomeSeries
              : WALLET_INCOME_SERIES,
          spendSeries:
            overview.spendSeries.length > 0
              ? overview.spendSeries
              : WALLET_SPEND_SERIES,
          transactionGroups: WALLET_TRANSACTION_GROUPS,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setView({
            balanceLabel: WALLET_BALANCE_LABEL,
            balancePoints: WALLET_BALANCE_POINTS,
            incomeSeries: WALLET_INCOME_SERIES,
            spendSeries: WALLET_SPEND_SERIES,
            transactionGroups: WALLET_TRANSACTION_GROUPS,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!view) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteWalletScreen
      balanceLabel={view.balanceLabel}
      balancePoints={view.balancePoints}
      incomeSeries={view.incomeSeries}
      spendSeries={view.spendSeries}
      transactionGroups={view.transactionGroups}
    />
  );
}
