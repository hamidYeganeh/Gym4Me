"use client";

import { Spinner } from "@heroui/react";
import type { CoachAnalyticsOverview, PaymentRecord } from "@repo/api";
import { useEffect, useState } from "react";
import { accountCoaching, accountFinance } from "@/shared/lib/api";
import { faDigits, formatTomans } from "@/shared/lib/booking-view";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachEarningsScreen } from "../screens/CoachEarningsScreen";
import {
  COACH_EARNINGS,
  type CoachEarningsData,
  type CoachSettlement,
} from "./coach-earnings-data";

function sumAmount(
  payments: PaymentRecord[],
  pick: (payment: PaymentRecord) => number | undefined,
): number {
  return payments.reduce((total, payment) => total + (pick(payment) ?? 0), 0);
}

function mapEarnings(
  overview: CoachAnalyticsOverview,
  payments: PaymentRecord[],
): CoachEarningsData {
  const captured = payments.filter((payment) => payment.status === "captured");
  const gross = sumAmount(captured, (p) => p.amount.gross);
  const platformFee = sumAmount(captured, (p) => p.amount.platformFee);
  const gatewayFee = sumAmount(captured, (p) => p.amount.gatewayFee);
  const net =
    sumAmount(captured, (p) => p.amount.net) ||
    Math.max(0, gross - platformFee - gatewayFee);
  const grossMillions = gross / 1_000_000;
  const sessionsSeries = overview.kpis.sessionsSeries;
  const revenueSeries =
    sessionsSeries.length > 0
      ? sessionsSeries.map(
          (value) =>
            Math.round(
              (value / Math.max(sessionsSeries.at(-1) ?? 1, 1)) *
                grossMillions *
                10,
            ) / 10,
        )
      : [grossMillions];

  const settlements: CoachSettlement[] = captured.slice(0, 6).map((payment, index) => ({
    id: payment._id,
    periodLabel: new Date(payment.capturedAt ?? payment.createdAt).toLocaleDateString(
      "fa-IR",
    ),
    amountLabel: formatTomans(payment.amount.net ?? payment.amount.gross),
    state: index === 0 ? "processing" : "paid",
  }));

  return {
    pendingPayoutLabel: faDigits(net.toLocaleString("en-US")),
    pendingPayoutHint:
      settlements[0] != null
        ? `آخرین پرداخت: ${settlements[0].periodLabel}`
        : "تسویه ثبت‌شده‌ای نیست",
    revenueTrend: revenueSeries.map((value, index) => ({
      label: String(index + 1),
      value,
    })),
    monthRevenueSeries: revenueSeries,
    monthRevenueComparisonSeries: revenueSeries.map((value) =>
      Math.max(0, Math.round(value * 0.8 * 10) / 10),
    ),
    monthRevenueValue: faDigits(grossMillions.toFixed(1).replace(".", "٫")),
    sessionsSeries,
    sessionsValue: faDigits(overview.kpis.sessionsValue),
    breakdown: [
      {
        id: "gross",
        label: "درآمد ناخالص",
        amountLabel: formatTomans(gross),
        kind: "gross",
      },
      {
        id: "platform",
        label: "سهم پلتفرم",
        amountLabel: `− ${formatTomans(platformFee)}`,
        kind: "deduction",
      },
      {
        id: "gateway",
        label: "کارمزد درگاه",
        amountLabel: `− ${formatTomans(gatewayFee)}`,
        kind: "deduction",
      },
      {
        id: "net",
        label: "تسویه خالص",
        amountLabel: formatTomans(net),
        kind: "net",
      },
    ],
    settlements,
  };
}

export function CoachEarningsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [earnings, setEarnings] = useState<CoachEarningsData | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setEarnings(COACH_EARNINGS);
      return;
    }

    let cancelled = false;
    Promise.all([
      accountCoaching.analyticsOverview("month"),
      accountFinance
        .listPayments({ page_size: 50, purpose: "package" })
        .catch(() => ({
          result: [] as PaymentRecord[],
          pagination: {
            page: 1,
            page_size: 50,
            next: null,
            prev: null,
            total: 0,
          },
        })),
    ])
      .then(([overview, paymentsPage]) => {
        if (cancelled) return;
        setEarnings(mapEarnings(overview, paymentsPage.result));
      })
      .catch(() => {
        if (!cancelled) setEarnings(COACH_EARNINGS);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!earnings) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <CoachEarningsScreen earnings={earnings} />;
}
