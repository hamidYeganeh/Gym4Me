import type { AreaLineChartPoint } from "@repo/ui/kit/AreaLineChart";

export type WalletTransactionDirection = "credit" | "debit";
export type WalletTransactionKind =
  | "booking"
  | "membership"
  | "refund"
  | "topup";

export type WalletTransaction = {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  amountLabel: string;
  direction: WalletTransactionDirection;
  kind: WalletTransactionKind;
};

export type WalletTransactionGroup = {
  id: string;
  dateLabel: string;
  items: WalletTransaction[];
};

export const WALLET_BALANCE_LABEL = "۲٬۴۵۰٬۰۰۰ تومان";

export const WALLET_BALANCE_POINTS: AreaLineChartPoint[] = [
  { label: "فروردین", value: 1200 },
  { label: "اردیبهشت", value: 1850 },
  { label: "خرداد", value: 1500 },
  { label: "تیر", value: 2100 },
  { label: "مرداد", value: 2450 },
];

export const WALLET_INCOME_SERIES = [320, 480, 260, 540, 410, 620, 500];
export const WALLET_SPEND_SERIES = [180, 350, 220, 460, 300, 380, 270];

export const WALLET_TRANSACTION_GROUPS: WalletTransactionGroup[] = [
  {
    id: "g-today",
    dateLabel: "امروز، ۱۶ مرداد ۱۴۰۵",
    items: [
      {
        id: "tx-1",
        title: "پرداخت کلاس یوگا صبحگاهی",
        dateLabel: "۱۶ مرداد",
        timeLabel: "۰۸:۴۵",
        amountLabel: "۱۹۶٬۲۰۰ تومان",
        direction: "debit",
        kind: "booking",
      },
      {
        id: "tx-2",
        title: "افزایش موجودی کیف پول",
        dateLabel: "۱۶ مرداد",
        timeLabel: "۰۸:۳۰",
        amountLabel: "۵۰۰٬۰۰۰ تومان",
        direction: "credit",
        kind: "topup",
      },
    ],
  },
  {
    id: "g-week",
    dateLabel: "سه‌شنبه ۱۳ مرداد ۱۴۰۵",
    items: [
      {
        id: "tx-3",
        title: "استرداد کلاس اسپینینگ",
        dateLabel: "۱۳ مرداد",
        timeLabel: "۱۹:۲۰",
        amountLabel: "۲۷۲٬۵۰۰ تومان",
        direction: "credit",
        kind: "refund",
      },
      {
        id: "tx-4",
        title: "تمدید عضویت باشگاه انرژی",
        dateLabel: "۱۳ مرداد",
        timeLabel: "۱۱:۰۵",
        amountLabel: "۱٬۸۰۰٬۰۰۰ تومان",
        direction: "debit",
        kind: "membership",
      },
    ],
  },
  {
    id: "g-earlier",
    dateLabel: "شنبه ۳ مرداد ۱۴۰۵",
    items: [
      {
        id: "tx-5",
        title: "پرداخت جلسه فانکشنال",
        dateLabel: "۳ مرداد",
        timeLabel: "۱۶:۵۰",
        amountLabel: "۴۳۶٬۰۰۰ تومان",
        direction: "debit",
        kind: "booking",
      },
      {
        id: "tx-6",
        title: "افزایش موجودی کیف پول",
        dateLabel: "۳ مرداد",
        timeLabel: "۰۹:۱۵",
        amountLabel: "۱٬۰۰۰٬۰۰۰ تومان",
        direction: "credit",
        kind: "topup",
      },
    ],
  },
];
