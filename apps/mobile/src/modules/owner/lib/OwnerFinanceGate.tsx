"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { Invoice, OwnerFinanceAnalytics } from "@repo/api";
import { statsColors } from "@repo/theme/stats-colors";
import { useEffect, useState } from "react";
import {
  formatJalaliDateTime,
  formatTomans,
} from "@/shared/lib/booking-view";
import { accountClubs, accountFinance } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerFinanceScreen } from "../screens/OwnerFinanceScreen";
import {
  OWNER_FINANCE,
  type OwnerFinanceData,
  type OwnerTransaction,
  type OwnerTransactionKind,
} from "./owner-finance-data";

function mapInvoiceKind(title: string): OwnerTransactionKind {
  const lower = title.toLowerCase();
  if (lower.includes("refund") || title.includes("بازپرداخت")) return "refund";
  if (lower.includes("book") || title.includes("رزرو")) return "booking";
  return "membership";
}

function mapInvoicesToTransactions(invoices: Invoice[]): OwnerTransaction[] {
  return invoices.slice(0, 12).map((invoice) => ({
    id: invoice.id,
    title: invoice.title,
    kind: mapInvoiceKind(invoice.title),
    amountLabel: formatTomans(invoice.amounts.payable),
    direction: invoice.status === "void" ? "debit" : "credit",
    dateLabel: formatJalaliDateTime(invoice.issuedAt),
  }));
}

function mapFinance(
  analytics: OwnerFinanceAnalytics,
  invoices: Invoice[],
): OwnerFinanceData {
  const revenueKpi = analytics.kpis.find((kpi) => kpi.id === "new-members");
  const refundSeries: number[] = [];
  const revenueSeries = revenueKpi?.series ?? [];
  const gross = analytics.totals.capturedGross;
  const grossMillions = Math.round(gross / 1_000_000);

  return {
    pendingAmountLabel: formatTomans(gross),
    nextPayoutLabel: "—",
    revenueValue: grossMillions,
    revenueSeries,
    revenueComparisonSeries: revenueKpi?.comparisonSeries ?? [],
    revenueColor: statsColors.blue,
    refundValue: 0,
    refundSeries,
    refundColor: statsColors.red,
    revenueTrend: revenueSeries.map((value, index) => ({
      label: String(index + 1),
      value,
    })),
    splitRows: [],
    settlements: [],
    transactions: mapInvoicesToTransactions(invoices),
  };
}

export function OwnerFinanceGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [finance, setFinance] = useState<OwnerFinanceData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setFinance(OWNER_FINANCE);
      return;
    }

    let cancelled = false;
    accountClubs
      .list({ page_size: 1 })
      .then(async (clubs) => {
        const clubId = clubs.result[0]?.id;
        if (!clubId) {
          if (!cancelled) {
            setFinance({
              ...OWNER_FINANCE,
              pendingAmountLabel: formatTomans(0),
              nextPayoutLabel: "—",
              revenueValue: 0,
              revenueSeries: [],
              revenueComparisonSeries: [],
              refundValue: 0,
              refundSeries: [],
              revenueTrend: [],
              splitRows: [],
              settlements: [],
              transactions: [],
            });
          }
          return;
        }
        const [analytics, invoices] = await Promise.all([
          accountFinance.ownerAnalytics(clubId, "month"),
          accountFinance.listInvoices({ page_size: 20 }),
        ]);
        if (!cancelled) setFinance(mapFinance(analytics, invoices.result));
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setFinance({
            pendingAmountLabel: formatTomans(0),
            nextPayoutLabel: "—",
            revenueValue: 0,
            revenueSeries: [],
            revenueComparisonSeries: [],
            revenueColor: statsColors.blue,
            refundValue: 0,
            refundSeries: [],
            refundColor: statsColors.red,
            revenueTrend: [],
            splitRows: [],
            settlements: [],
            transactions: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!finance) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="px-4 pt-2 text-center">
          <Typography className="text-danger" type="body-sm">
            بارگذاری مالی ناموفق بود.
          </Typography>
        </div>
      ) : null}
      <OwnerFinanceScreen finance={finance} />
    </>
  );
}
