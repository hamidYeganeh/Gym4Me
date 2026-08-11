"use client";

import { Spinner } from "@heroui/react";
import type { Invoice as ApiInvoice } from "@repo/api";
import { useEffect, useState } from "react";
import { accountFinance } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { PaymentInvoiceScreen } from "../screens/PaymentInvoiceScreen";
import {
  getInvoice,
  WALLET_BALANCE_LABEL,
  type Invoice,
} from "./payment-data";

function formatAmount(value: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}

function mapInvoice(api: ApiInvoice): Invoice {
  return {
    id: api.id,
    title: api.title,
    clubName: api.party.clubName ?? "—",
    items: api.lines.map((line) => ({
      label: line.title,
      amountLabel: formatAmount(line.total),
    })),
    discountLabel:
      api.amounts.discount > 0
        ? formatAmount(api.amounts.discount)
        : undefined,
    taxLabel: formatAmount(api.amounts.tax),
    totalLabel: formatAmount(api.amounts.payable),
    payable: api.amounts.payable,
  };
}

type PaymentInvoiceGateProps = {
  invoiceId: string;
};

export function PaymentInvoiceGate({ invoiceId }: PaymentInvoiceGateProps) {
  const { isAuthenticated, isReady } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [balanceLabel, setBalanceLabel] = useState(WALLET_BALANCE_LABEL);

  useEffect(() => {
    if (!isReady) return;

    const demo = getInvoice(invoiceId);
    if (!isAuthenticated) {
      setInvoice(demo);
      setBalanceLabel(WALLET_BALANCE_LABEL);
      return;
    }

    let cancelled = false;
    Promise.all([
      accountFinance.getInvoice(invoiceId).catch(() => null),
      accountFinance.walletOverview().catch(() => null),
    ]).then(([apiInvoice, wallet]) => {
      if (cancelled) return;
      setInvoice(apiInvoice ? mapInvoice(apiInvoice) : demo);
      if (wallet) {
        setBalanceLabel(
          `${new Intl.NumberFormat("fa-IR").format(wallet.balance)} تومان`,
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [invoiceId, isAuthenticated, isReady]);

  if (!invoice) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <PaymentInvoiceScreen
      invoice={invoice}
      walletBalanceLabel={balanceLabel}
    />
  );
}
