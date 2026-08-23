import type { PaymentPurpose, PaymentRecord } from "@repo/api";
import { formatJalaliFullDate, formatTomans } from "@/shared/lib/booking-view";
import type {
  WalletTransaction,
  WalletTransactionGroup,
  WalletTransactionKind,
} from "./wallet-data";

const PURPOSE_TITLE: Record<PaymentPurpose, string> = {
  booking: "پرداخت رزرو",
  membership: "خرید عضویت",
  wallet_topup: "افزایش موجودی کیف پول",
  package: "خرید پکیج",
  platform_subscription: "اشتراک پلتفرم",
  manual: "پرداخت دستی",
};

function paymentKind(
  purpose: PaymentPurpose,
  status: PaymentRecord["status"],
): WalletTransactionKind {
  if (status === "refunded" || status === "partially_refunded") {
    return "refund";
  }
  if (purpose === "wallet_topup") return "topup";
  if (purpose === "membership") return "membership";
  if (purpose === "booking") return "booking";
  return "topup";
}

function paymentDirection(
  purpose: PaymentPurpose,
  status: PaymentRecord["status"],
): WalletTransaction["direction"] {
  if (status === "refunded" || status === "partially_refunded") {
    return "credit";
  }
  return purpose === "wallet_topup" || purpose === "manual"
    ? "credit"
    : "debit";
}

function displayAmount(payment: PaymentRecord): number {
  if (
    payment.status === "refunded" ||
    payment.status === "partially_refunded"
  ) {
    return Math.max(0, payment.refundedAmount ?? 0);
  }
  const gross = payment.amount.gross ?? 0;
  const discount = payment.amount.discount ?? 0;
  return Math.max(0, gross - discount);
}

function groupKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Maps account payment history into the wallet screen transaction groups. */
export function mapPaymentsToWalletGroups(
  payments: PaymentRecord[],
): WalletTransactionGroup[] {
  const sorted = [...payments].sort(
    (a, b) =>
      new Date(b.capturedAt ?? b.createdAt).getTime() -
      new Date(a.capturedAt ?? a.createdAt).getTime(),
  );

  const groups = new Map<string, WalletTransactionGroup>();

  for (const payment of sorted) {
    if (
      payment.status !== "captured" &&
      payment.status !== "refunded" &&
      payment.status !== "partially_refunded"
    ) {
      continue;
    }
    const when = payment.capturedAt ?? payment.createdAt;
    const key = groupKey(when);
    const date = new Date(when);
    const timeLabel = new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
    const item: WalletTransaction = {
      id: payment._id,
      title: PURPOSE_TITLE[payment.purpose] ?? "تراکنش",
      dateLabel: formatJalaliFullDate(when),
      timeLabel,
      amountLabel: formatTomans(displayAmount(payment)),
      direction: paymentDirection(payment.purpose, payment.status),
      kind: paymentKind(payment.purpose, payment.status),
    };

    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        id: `day-${key}`,
        dateLabel: formatJalaliFullDate(when),
        items: [item],
      });
    }
  }

  return Array.from(groups.values());
}
