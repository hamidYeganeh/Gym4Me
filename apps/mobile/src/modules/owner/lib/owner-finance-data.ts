import { statsColors } from "@repo/theme";

export type OwnerSettlementState = "paid" | "processing" | "upcoming";
export type OwnerTransactionKind = "membership" | "booking" | "refund";
export type OwnerTransactionDirection = "credit" | "debit";

export type OwnerFinanceSplitRow = {
  id: string;
  label: string;
  amountLabel: string;
  /** Final net-settle row rendered bold after a divider. */
  isTotal?: boolean;
};

export type OwnerSettlement = {
  id: string;
  periodLabel: string;
  amountLabel: string;
  state: OwnerSettlementState;
};

export type OwnerTransaction = {
  id: string;
  title: string;
  kind: OwnerTransactionKind;
  amountLabel: string;
  direction: OwnerTransactionDirection;
  dateLabel: string;
};

export type OwnerFinanceData = {
  pendingAmountLabel: string;
  nextPayoutLabel: string;
  revenueValue: number;
  revenueSeries: number[];
  revenueComparisonSeries: number[];
  revenueColor: string;
  refundValue: number;
  refundSeries: number[];
  refundColor: string;
  revenueTrend: { label: string; value: number }[];
  splitRows: OwnerFinanceSplitRow[];
  settlements: OwnerSettlement[];
  transactions: OwnerTransaction[];
};

export const OWNER_FINANCE: OwnerFinanceData = {
  pendingAmountLabel: "۳۸٬۴۰۰٬۰۰۰ تومان",
  nextPayoutLabel: "پنجشنبه، ۲۵ خرداد ۱۴۰۴",
  revenueValue: 42,
  revenueSeries: [22, 28, 26, 34, 31, 39, 42],
  revenueComparisonSeries: [18, 22, 24, 26, 25, 30, 33],
  revenueColor: statsColors.blue,
  refundValue: 3,
  refundSeries: [1, 2, 1, 3, 2, 4, 3],
  refundColor: statsColors.red,
  revenueTrend: [
    { label: "فروردین", value: 28 },
    { label: "اردیبهشت", value: 33 },
    { label: "خرداد", value: 31 },
    { label: "تیر", value: 38 },
    { label: "مرداد", value: 36 },
    { label: "شهریور", value: 42 },
  ],
  // Ledger split: amount − discount − tax − provider share − platform fee − gateway fee = net settle.
  splitRows: [
    { id: "gross", label: "ناخالص فروش", amountLabel: "۴۸٬۲۰۰٬۰۰۰ تومان" },
    { id: "discount", label: "تخفیف", amountLabel: "−۲٬۴۰۰٬۰۰۰ تومان" },
    { id: "tax", label: "مالیات", amountLabel: "−۳٬۱۰۰٬۰۰۰ تومان" },
    {
      id: "provider",
      label: "سهم ارائه‌دهنده",
      amountLabel: "−۲٬۶۰۰٬۰۰۰ تومان",
    },
    {
      id: "platform",
      label: "کارمزد پلتفرم",
      amountLabel: "−۱٬۲۰۰٬۰۰۰ تومان",
    },
    { id: "gateway", label: "کارمزد درگاه", amountLabel: "−۵۰۰٬۰۰۰ تومان" },
    {
      id: "net",
      label: "تسویه خالص",
      amountLabel: "۳۸٬۴۰۰٬۰۰۰ تومان",
      isTotal: true,
    },
  ],
  settlements: [
    {
      id: "s-khordad",
      periodLabel: "خرداد ۱۴۰۴",
      amountLabel: "۳۸٬۴۰۰٬۰۰۰ تومان",
      state: "processing",
    },
    {
      id: "s-ordibehesht",
      periodLabel: "اردیبهشت ۱۴۰۴",
      amountLabel: "۳۳٬۹۰۰٬۰۰۰ تومان",
      state: "paid",
    },
    {
      id: "s-farvardin",
      periodLabel: "فروردین ۱۴۰۴",
      amountLabel: "۲۸٬۶۰۰٬۰۰۰ تومان",
      state: "paid",
    },
    {
      id: "s-tir",
      periodLabel: "تیر ۱۴۰۴",
      amountLabel: "برآورد ۴۱٬۰۰۰٬۰۰۰ تومان",
      state: "upcoming",
    },
  ],
  transactions: [
    {
      id: "t1",
      title: "تمدید عضویت — سارا محمدی",
      kind: "membership",
      amountLabel: "۲٬۴۰۰٬۰۰۰ تومان",
      direction: "credit",
      dateLabel: "امروز، ۰۹:۱۲",
    },
    {
      id: "t2",
      title: "رزرو سانس اختصاصی — علی رضایی",
      kind: "booking",
      amountLabel: "۴۵۰٬۰۰۰ تومان",
      direction: "credit",
      dateLabel: "امروز، ۰۸:۰۳",
    },
    {
      id: "t3",
      title: "بازپرداخت کلاس لغوشده — مریم حسینی",
      kind: "refund",
      amountLabel: "۳۸۰٬۰۰۰ تومان",
      direction: "debit",
      dateLabel: "دیروز، ۱۸:۴۰",
    },
    {
      id: "t4",
      title: "عضویت جدید — پریسا کاظمی",
      kind: "membership",
      amountLabel: "۱٬۸۰۰٬۰۰۰ تومان",
      direction: "credit",
      dateLabel: "دیروز، ۱۱:۲۵",
    },
    {
      id: "t5",
      title: "رزرو کلاس گروهی — رضا نوری",
      kind: "booking",
      amountLabel: "۲۲۰٬۰۰۰ تومان",
      direction: "credit",
      dateLabel: "۲۲ خرداد ۱۴۰۴",
    },
  ],
};
