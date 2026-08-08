export type CoachSettlementState = "paid" | "processing" | "upcoming";

export type CoachSettlement = {
  id: string;
  periodLabel: string;
  amountLabel: string;
  state: CoachSettlementState;
};

export type CoachEarningsBreakdownRow = {
  id: string;
  label: string;
  amountLabel: string;
  kind: "gross" | "deduction" | "net";
};

export type CoachEarningsData = {
  pendingPayoutLabel: string;
  pendingPayoutHint: string;
  revenueTrend: { label: string; value: number }[];
  monthRevenueSeries: number[];
  monthRevenueComparisonSeries: number[];
  monthRevenueValue: string;
  sessionsSeries: number[];
  sessionsValue: string;
  breakdown: CoachEarningsBreakdownRow[];
  settlements: CoachSettlement[];
};

export const COACH_EARNINGS: CoachEarningsData = {
  pendingPayoutLabel: "۱۲٬۴۵۰٬۰۰۰",
  pendingPayoutHint: "تسویه بعدی: شنبه ۱ شهریور",
  revenueTrend: [
    { label: "فروردین", value: 18.2 },
    { label: "اردیبهشت", value: 21.6 },
    { label: "خرداد", value: 19.4 },
    { label: "تیر", value: 24.8 },
    { label: "مرداد", value: 27.3 },
    { label: "شهریور", value: 31.5 },
  ],
  monthRevenueSeries: [18, 22, 19, 25, 27, 32],
  monthRevenueComparisonSeries: [15, 17, 18, 20, 22, 24],
  monthRevenueValue: "۳۱٫۵",
  sessionsSeries: [34, 41, 38, 46, 52, 57],
  sessionsValue: "۵۷",
  breakdown: [
    {
      id: "gross",
      label: "درآمد ناخالص",
      amountLabel: "۳۱٬۵۰۰٬۰۰۰ تومان",
      kind: "gross",
    },
    {
      id: "platform",
      label: "سهم پلتفرم",
      amountLabel: "− ۳٬۱۵۰٬۰۰۰ تومان",
      kind: "deduction",
    },
    {
      id: "gateway",
      label: "کارمزد درگاه",
      amountLabel: "− ۴۷۲٬۵۰۰ تومان",
      kind: "deduction",
    },
    {
      id: "net",
      label: "تسویه خالص",
      amountLabel: "۲۷٬۸۷۷٬۵۰۰ تومان",
      kind: "net",
    },
  ],
  settlements: [
    {
      id: "s1",
      periodLabel: "نیمه دوم مرداد",
      amountLabel: "۱۲٬۴۵۰٬۰۰۰ تومان",
      state: "upcoming",
    },
    {
      id: "s2",
      periodLabel: "نیمه اول مرداد",
      amountLabel: "۱۵٬۴۲۷٬۵۰۰ تومان",
      state: "processing",
    },
    {
      id: "s3",
      periodLabel: "نیمه دوم تیر",
      amountLabel: "۱۳٬۹۸۰٬۰۰۰ تومان",
      state: "paid",
    },
    {
      id: "s4",
      periodLabel: "نیمه اول تیر",
      amountLabel: "۱۰٬۸۶۰٬۰۰۰ تومان",
      state: "paid",
    },
  ],
};
