"use client";

import { Spinner, Typography } from "@heroui/react";
import type { Invoice as ApiInvoice } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { accountFinance, isDiscoveryApiId } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { PaymentInvoiceScreen } from "../screens/PaymentInvoiceScreen";
import type { PaymentMethodId } from "../screens/PaymentInvoiceScreen";
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
  const t = useTranslations("Payment");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isReady } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [balanceLabel, setBalanceLabel] = useState(WALLET_BALANCE_LABEL);
  const [fromApi, setFromApi] = useState(false);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const successFlag = searchParams.get("status") === "success";
  const alreadyPaid = fromApi || successFlag;

  useEffect(() => {
    if (!isReady) return;

    const demo = getInvoice(invoiceId) ?? null;
    if (!isAuthenticated) {
      setInvoice(demo);
      setFromApi(false);
      setBalanceLabel(WALLET_BALANCE_LABEL);
      return;
    }

    let cancelled = false;
    Promise.all([
      isDiscoveryApiId(invoiceId) || invoiceId.length >= 20
        ? accountFinance.getInvoice(invoiceId).catch(() => null)
        : Promise.resolve(null),
      accountFinance.walletOverview().catch(() => null),
    ]).then(([apiInvoice, wallet]) => {
      if (cancelled) return;
      if (apiInvoice) {
        setInvoice(mapInvoice(apiInvoice));
        setFromApi(true);
      } else {
        setInvoice(demo);
        setFromApi(false);
      }
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

  const handlePay = useCallback(
    async (method: PaymentMethodId) => {
      if (!invoice) return;
      // Demo fixtures keep the local success path.
      if (!fromApi) {
        router.push(
          `/athlete/payment/result?status=success&invoice=${invoice.id}`,
        );
        return;
      }
      // Live invoices are issued after capture — nothing left to charge.
      setPending(true);
      setActionError(null);
      try {
        if (method === "wallet") {
          // Wallet top-up is available from the wallet screen; invoice is a receipt.
          router.push("/athlete/wallet");
          return;
        }
        router.push(
          `/athlete/payment/result?status=success&invoice=${invoice.id}`,
        );
      } catch (error) {
        setActionError(
          error instanceof ApiError ? error.message : t("payError"),
        );
      } finally {
        setPending(false);
      }
    },
    [fromApi, invoice, router, t],
  );

  if (!invoice) {
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
      <PaymentInvoiceScreen
        alreadyPaid={alreadyPaid}
        invoice={invoice}
        onPaidContinue={() => router.push("/athlete/memberships")}
        onPay={(method) => void handlePay(method)}
        pending={pending}
        walletBalanceLabel={balanceLabel}
      />
    </>
  );
}
