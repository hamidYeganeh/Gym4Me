import { statsColors } from "@repo/theme";

export type OwnerAnalyticsPeriodId = "week" | "month" | "quarter";

export type OwnerAnalyticsKpi = {
  id: "new-members" | "renewal" | "churn" | "attendance";
  value: number;
  chart: "line" | "bar";
  color: string;
  series: number[];
  comparisonSeries?: number[];
};

export type OwnerAnalyticsBarRow = {
  id: string;
  label: string;
  /** 0–100 relative fill for the horizontal bar. */
  percent: number;
  countLabel?: string;
};

export type OwnerAnalyticsFunnelStep = {
  id: string;
  label: string;
  valueLabel: string;
  /** 0–100 relative bar width. */
  percent: number;
  /** Conversion from previous step, e.g. "۳۲٪". Absent on the first step. */
  conversionLabel?: string;
};

export type OwnerAnalyticsDataset = {
  kpis: OwnerAnalyticsKpi[];
  membershipTrend: { label: string; value: number }[];
  busyHours: OwnerAnalyticsBarRow[];
  classPopularity: OwnerAnalyticsBarRow[];
  funnel: OwnerAnalyticsFunnelStep[];
};

const WEEK_DATASET: OwnerAnalyticsDataset = {
  kpis: [
    {
      id: "new-members",
      value: 14,
      chart: "line",
      color: statsColors.blue,
      series: [1, 3, 2, 5, 4, 6, 14],
    },
    {
      id: "renewal",
      value: 81,
      chart: "line",
      color: statsColors.yellow,
      series: [72, 75, 74, 78, 77, 80, 81],
      comparisonSeries: [68, 70, 71, 72, 73, 74, 75],
    },
    {
      id: "churn",
      value: 4,
      chart: "line",
      color: statsColors.red,
      series: [7, 6, 6, 5, 5, 4, 4],
    },
    {
      id: "attendance",
      value: 3,
      chart: "bar",
      color: statsColors.purple,
      series: [2, 3, 2, 4, 3, 4, 3],
    },
  ],
  membershipTrend: [
    { label: "شنبه", value: 236 },
    { label: "یکشنبه", value: 238 },
    { label: "دوشنبه", value: 240 },
    { label: "سه‌شنبه", value: 241 },
    { label: "چهارشنبه", value: 244 },
    { label: "پنجشنبه", value: 246 },
    { label: "جمعه", value: 248 },
  ],
  busyHours: [
    { id: "h6", label: "۶ تا ۹", percent: 62 },
    { id: "h9", label: "۹ تا ۱۲", percent: 38 },
    { id: "h12", label: "۱۲ تا ۱۵", percent: 24 },
    { id: "h15", label: "۱۵ تا ۱۸", percent: 51 },
    { id: "h18", label: "۱۸ تا ۲۱", percent: 94 },
    { id: "h21", label: "۲۱ تا ۲۳", percent: 70 },
  ],
  classPopularity: [
    { id: "hiit", label: "پاور HIIT", percent: 92, countLabel: "۸۶ رزرو" },
    {
      id: "strength",
      label: "سیرکت قدرتی",
      percent: 74,
      countLabel: "۶۹ رزرو",
    },
    { id: "yoga", label: "یوگا فلو", percent: 58, countLabel: "۵۴ رزرو" },
    { id: "spin", label: "اسپین برن", percent: 41, countLabel: "۳۸ رزرو" },
  ],
  funnel: [
    { id: "visits", label: "بازدید", valueLabel: "۱٬۲۴۰", percent: 100 },
    {
      id: "trials",
      label: "رزرو آزمایشی",
      valueLabel: "۱۸۶",
      percent: 42,
      conversionLabel: "۱۵٪",
    },
    {
      id: "memberships",
      label: "عضویت",
      valueLabel: "۵۹",
      percent: 18,
      conversionLabel: "۳۲٪",
    },
  ],
};

const MONTH_DATASET: OwnerAnalyticsDataset = {
  kpis: [
    {
      id: "new-members",
      value: 52,
      chart: "line",
      color: statsColors.blue,
      series: [6, 12, 9, 18, 15, 34, 52],
    },
    {
      id: "renewal",
      value: 78,
      chart: "line",
      color: statsColors.yellow,
      series: [70, 72, 71, 75, 74, 77, 78],
      comparisonSeries: [66, 68, 69, 70, 71, 72, 73],
    },
    {
      id: "churn",
      value: 6,
      chart: "line",
      color: statsColors.red,
      series: [9, 8, 8, 7, 7, 6, 6],
    },
    {
      id: "attendance",
      value: 12,
      chart: "bar",
      color: statsColors.purple,
      series: [8, 10, 9, 12, 11, 13, 12],
    },
  ],
  membershipTrend: [
    { label: "هفته ۱", value: 218 },
    { label: "هفته ۲", value: 226 },
    { label: "هفته ۳", value: 238 },
    { label: "هفته ۴", value: 248 },
  ],
  busyHours: [
    { id: "h6", label: "۶ تا ۹", percent: 58 },
    { id: "h9", label: "۹ تا ۱۲", percent: 41 },
    { id: "h12", label: "۱۲ تا ۱۵", percent: 27 },
    { id: "h15", label: "۱۵ تا ۱۸", percent: 55 },
    { id: "h18", label: "۱۸ تا ۲۱", percent: 100 },
    { id: "h21", label: "۲۱ تا ۲۳", percent: 66 },
  ],
  classPopularity: [
    { id: "hiit", label: "پاور HIIT", percent: 100, countLabel: "۳۴۲ رزرو" },
    {
      id: "strength",
      label: "سیرکت قدرتی",
      percent: 81,
      countLabel: "۲۷۷ رزرو",
    },
    { id: "yoga", label: "یوگا فلو", percent: 63, countLabel: "۲۱۵ رزرو" },
    { id: "spin", label: "اسپین برن", percent: 44, countLabel: "۱۵۰ رزرو" },
  ],
  funnel: [
    { id: "visits", label: "بازدید", valueLabel: "۵٬۴۸۰", percent: 100 },
    {
      id: "trials",
      label: "رزرو آزمایشی",
      valueLabel: "۷۶۲",
      percent: 45,
      conversionLabel: "۱۴٪",
    },
    {
      id: "memberships",
      label: "عضویت",
      valueLabel: "۲۳۱",
      percent: 20,
      conversionLabel: "۳۰٪",
    },
  ],
};

const QUARTER_DATASET: OwnerAnalyticsDataset = {
  kpis: [
    {
      id: "new-members",
      value: 148,
      chart: "line",
      color: statsColors.blue,
      series: [24, 38, 33, 52, 47, 96, 148],
    },
    {
      id: "renewal",
      value: 74,
      chart: "line",
      color: statsColors.yellow,
      series: [66, 69, 68, 71, 70, 73, 74],
      comparisonSeries: [62, 64, 65, 66, 67, 68, 69],
    },
    {
      id: "churn",
      value: 9,
      chart: "line",
      color: statsColors.red,
      series: [13, 12, 12, 11, 10, 9, 9],
    },
    {
      id: "attendance",
      value: 34,
      chart: "bar",
      color: statsColors.purple,
      series: [24, 28, 26, 34, 31, 37, 34],
    },
  ],
  membershipTrend: [
    { label: "فروردین", value: 184 },
    { label: "اردیبهشت", value: 212 },
    { label: "خرداد", value: 248 },
  ],
  busyHours: [
    { id: "h6", label: "۶ تا ۹", percent: 54 },
    { id: "h9", label: "۹ تا ۱۲", percent: 43 },
    { id: "h12", label: "۱۲ تا ۱۵", percent: 30 },
    { id: "h15", label: "۱۵ تا ۱۸", percent: 57 },
    { id: "h18", label: "۱۸ تا ۲۱", percent: 97 },
    { id: "h21", label: "۲۱ تا ۲۳", percent: 61 },
  ],
  classPopularity: [
    { id: "hiit", label: "پاور HIIT", percent: 96, countLabel: "۹۸۰ رزرو" },
    {
      id: "strength",
      label: "سیرکت قدرتی",
      percent: 84,
      countLabel: "۸۵۶ رزرو",
    },
    { id: "yoga", label: "یوگا فلو", percent: 66, countLabel: "۶۷۲ رزرو" },
    { id: "spin", label: "اسپین برن", percent: 39, countLabel: "۴۰۱ رزرو" },
  ],
  funnel: [
    { id: "visits", label: "بازدید", valueLabel: "۱۶٬۲۰۰", percent: 100 },
    {
      id: "trials",
      label: "رزرو آزمایشی",
      valueLabel: "۲٬۱۴۰",
      percent: 47,
      conversionLabel: "۱۳٪",
    },
    {
      id: "memberships",
      label: "عضویت",
      valueLabel: "۶۶۴",
      percent: 22,
      conversionLabel: "۳۱٪",
    },
  ],
};

export const OWNER_ANALYTICS: Record<
  OwnerAnalyticsPeriodId,
  OwnerAnalyticsDataset
> = {
  week: WEEK_DATASET,
  month: MONTH_DATASET,
  quarter: QUARTER_DATASET,
};

export const OWNER_ANALYTICS_PERIODS: OwnerAnalyticsPeriodId[] = [
  "week",
  "month",
  "quarter",
];
