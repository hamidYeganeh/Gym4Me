/**
 * Temporary analytics fixtures. Shapes mirror what the analytics API adapter
 * will eventually return, so screens/sections can switch to `@repo/api`
 * without prop changes.
 */

export const ANALYTICS_PERIODS = ["week", "month", "quarter"] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export type AnalyticsKpiId =
  | "activeUsers"
  | "bookings"
  | "grossRevenue"
  | "conversionRate";

export type AnalyticsKpi = {
  id: AnalyticsKpiId;
  value: number;
  series: number[];
  comparisonSeries?: number[];
};

export type AnalyticsTrendPoint = {
  label: string;
  value: number;
};

export type AcquisitionSourceId =
  | "organic"
  | "referral"
  | "campaign"
  | "direct";

export type AcquisitionSource = {
  id: AcquisitionSourceId;
  count: number;
};

export type FunnelStepId =
  | "visit"
  | "signup"
  | "kyc"
  | "firstBooking"
  | "payment";

export type FunnelStep = {
  id: FunnelStepId;
  count: number;
};

export type MarketplaceEntry = {
  id: string;
  name: string;
  count: number;
};

export type RetentionCohort = {
  /** 1-based cohort index (weekly cohorts). */
  index: number;
  /** Retention percent per period; null = period not reached yet. */
  values: (number | null)[];
};

export const BOOKING_STATUSES = [
  "PENDING",
  "AWAITING_PAYMENT",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "REFUND_REQUESTED",
  "REFUNDED",
  "REJECTED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingStatusRow = {
  status: BookingStatus;
  count: number;
};

export type BookingStatusTone = "success" | "warning" | "danger" | "default";

export const BOOKING_STATUS_TONES: Record<BookingStatus, BookingStatusTone> = {
  PENDING: "warning",
  AWAITING_PAYMENT: "warning",
  CONFIRMED: "success",
  CHECKED_IN: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
  NO_SHOW: "danger",
  REFUND_REQUESTED: "warning",
  REFUNDED: "default",
  REJECTED: "danger",
};

export type AnalyticsDataset = {
  kpis: AnalyticsKpi[];
  signupTrend: AnalyticsTrendPoint[];
  revenueTrend: AnalyticsTrendPoint[];
  acquisition: AcquisitionSource[];
  funnel: FunnelStep[];
  topClubs: MarketplaceEntry[];
  topCoaches: MarketplaceEntry[];
  retention: RetentionCohort[];
  bookingStatuses: BookingStatusRow[];
};

const FA_NUMBER = new Intl.NumberFormat("fa-IR");
const FA_PERCENT = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
});

export function formatFaNumber(value: number): string {
  return FA_NUMBER.format(value);
}

export function formatFaPercent(value: number): string {
  return `${FA_PERCENT.format(value)}٪`;
}

const WEEK_LABELS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

const MONTH_LABELS = ["هفته ۱", "هفته ۲", "هفته ۳", "هفته ۴"];

const QUARTER_LABELS = ["تیر", "مرداد", "شهریور"];

function toTrend(labels: string[], values: number[]): AnalyticsTrendPoint[] {
  return labels.map((label, index) => ({ label, value: values[index] ?? 0 }));
}

const RETENTION_FIXTURE: RetentionCohort[] = [
  { index: 1, values: [100, 62, 48, 41, 36, 33] },
  { index: 2, values: [100, 58, 45, 38, 34, null] },
  { index: 3, values: [100, 64, 51, 43, null, null] },
  { index: 4, values: [100, 60, 47, null, null, null] },
  { index: 5, values: [100, 66, null, null, null, null] },
  { index: 6, values: [100, null, null, null, null, null] },
];

export const ANALYTICS_DATA: Record<AnalyticsPeriod, AnalyticsDataset> = {
  week: {
    kpis: [
      {
        id: "activeUsers",
        value: 2840,
        series: [310, 356, 402, 388, 452, 486, 446],
        comparisonSeries: [284, 322, 348, 356, 398, 412, 388],
      },
      {
        id: "bookings",
        value: 1284,
        series: [142, 168, 176, 158, 214, 232, 194],
      },
      {
        id: "grossRevenue",
        value: 486,
        series: [54, 61, 68, 63, 82, 88, 70],
        comparisonSeries: [48, 52, 58, 56, 68, 72, 61],
      },
      {
        id: "conversionRate",
        value: 4.6,
        series: [3.8, 4.1, 4.4, 4.2, 4.8, 5.1, 4.7],
      },
    ],
    signupTrend: toTrend(WEEK_LABELS, [46, 58, 64, 52, 78, 92, 71]),
    revenueTrend: toTrend(WEEK_LABELS, [54, 61, 68, 63, 82, 88, 70]),
    acquisition: [
      { id: "organic", count: 168 },
      { id: "referral", count: 121 },
      { id: "campaign", count: 84 },
      { id: "direct", count: 48 },
    ],
    funnel: [
      { id: "visit", count: 12400 },
      { id: "signup", count: 421 },
      { id: "kyc", count: 268 },
      { id: "firstBooking", count: 176 },
      { id: "payment", count: 149 },
    ],
    topClubs: [
      { id: "club-1", name: "باشگاه انرژی تهران", count: 96 },
      { id: "club-2", name: "مجموعه ورزشی آریا", count: 84 },
      { id: "club-3", name: "باشگاه پارسیان", count: 71 },
      { id: "club-4", name: "فیت‌لند سعادت‌آباد", count: 58 },
      { id: "club-5", name: "باشگاه المپیک کرج", count: 44 },
    ],
    topCoaches: [
      { id: "coach-1", name: "سارا محمدی", count: 42 },
      { id: "coach-2", name: "علی رضایی", count: 38 },
      { id: "coach-3", name: "مریم احمدی", count: 31 },
      { id: "coach-4", name: "حسین کریمی", count: 27 },
      { id: "coach-5", name: "نگار موسوی", count: 22 },
    ],
    retention: RETENTION_FIXTURE,
    bookingStatuses: [
      { status: "PENDING", count: 64 },
      { status: "AWAITING_PAYMENT", count: 38 },
      { status: "CONFIRMED", count: 412 },
      { status: "CHECKED_IN", count: 186 },
      { status: "COMPLETED", count: 498 },
      { status: "CANCELLED", count: 52 },
      { status: "NO_SHOW", count: 14 },
      { status: "REFUND_REQUESTED", count: 9 },
      { status: "REFUNDED", count: 7 },
      { status: "REJECTED", count: 4 },
    ],
  },
  month: {
    kpis: [
      {
        id: "activeUsers",
        value: 9620,
        series: [2140, 2320, 2480, 2680],
        comparisonSeries: [1960, 2080, 2180, 2310],
      },
      {
        id: "bookings",
        value: 5312,
        series: [1180, 1264, 1388, 1480],
      },
      {
        id: "grossRevenue",
        value: 1980,
        series: [438, 472, 512, 558],
        comparisonSeries: [396, 421, 452, 488],
      },
      {
        id: "conversionRate",
        value: 4.9,
        series: [4.3, 4.6, 5.0, 5.2],
      },
    ],
    signupTrend: toTrend(MONTH_LABELS, [242, 268, 312, 356]),
    revenueTrend: toTrend(MONTH_LABELS, [438, 472, 512, 558]),
    acquisition: [
      { id: "organic", count: 642 },
      { id: "referral", count: 486 },
      { id: "campaign", count: 371 },
      { id: "direct", count: 179 },
    ],
    funnel: [
      { id: "visit", count: 52800 },
      { id: "signup", count: 1678 },
      { id: "kyc", count: 1094 },
      { id: "firstBooking", count: 742 },
      { id: "payment", count: 631 },
    ],
    topClubs: [
      { id: "club-1", name: "باشگاه انرژی تهران", count: 388 },
      { id: "club-2", name: "مجموعه ورزشی آریا", count: 341 },
      { id: "club-3", name: "فیت‌لند سعادت‌آباد", count: 296 },
      { id: "club-4", name: "باشگاه پارسیان", count: 262 },
      { id: "club-5", name: "باشگاه المپیک کرج", count: 197 },
    ],
    topCoaches: [
      { id: "coach-1", name: "سارا محمدی", count: 168 },
      { id: "coach-2", name: "مریم احمدی", count: 149 },
      { id: "coach-3", name: "علی رضایی", count: 141 },
      { id: "coach-4", name: "نگار موسوی", count: 118 },
      { id: "coach-5", name: "حسین کریمی", count: 102 },
    ],
    retention: RETENTION_FIXTURE,
    bookingStatuses: [
      { status: "PENDING", count: 214 },
      { status: "AWAITING_PAYMENT", count: 132 },
      { status: "CONFIRMED", count: 1642 },
      { status: "CHECKED_IN", count: 748 },
      { status: "COMPLETED", count: 2186 },
      { status: "CANCELLED", count: 218 },
      { status: "NO_SHOW", count: 68 },
      { status: "REFUND_REQUESTED", count: 41 },
      { status: "REFUNDED", count: 34 },
      { status: "REJECTED", count: 29 },
    ],
  },
  quarter: {
    kpis: [
      {
        id: "activeUsers",
        value: 24800,
        series: [7480, 8320, 9620],
        comparisonSeries: [6620, 7180, 7960],
      },
      {
        id: "bookings",
        value: 14260,
        series: [4210, 4738, 5312],
      },
      {
        id: "grossRevenue",
        value: 5340,
        series: [1580, 1780, 1980],
        comparisonSeries: [1320, 1490, 1660],
      },
      {
        id: "conversionRate",
        value: 4.7,
        series: [4.2, 4.5, 4.9],
      },
    ],
    signupTrend: toTrend(QUARTER_LABELS, [864, 1042, 1178]),
    revenueTrend: toTrend(QUARTER_LABELS, [1580, 1780, 1980]),
    acquisition: [
      { id: "organic", count: 1684 },
      { id: "referral", count: 1247 },
      { id: "campaign", count: 962 },
      { id: "direct", count: 491 },
    ],
    funnel: [
      { id: "visit", count: 148600 },
      { id: "signup", count: 4384 },
      { id: "kyc", count: 2872 },
      { id: "firstBooking", count: 1961 },
      { id: "payment", count: 1668 },
    ],
    topClubs: [
      { id: "club-1", name: "باشگاه انرژی تهران", count: 1092 },
      { id: "club-2", name: "فیت‌لند سعادت‌آباد", count: 934 },
      { id: "club-3", name: "مجموعه ورزشی آریا", count: 871 },
      { id: "club-4", name: "باشگاه پارسیان", count: 718 },
      { id: "club-5", name: "باشگاه المپیک کرج", count: 566 },
    ],
    topCoaches: [
      { id: "coach-1", name: "سارا محمدی", count: 452 },
      { id: "coach-2", name: "مریم احمدی", count: 417 },
      { id: "coach-3", name: "نگار موسوی", count: 366 },
      { id: "coach-4", name: "علی رضایی", count: 348 },
      { id: "coach-5", name: "حسین کریمی", count: 291 },
    ],
    retention: RETENTION_FIXTURE,
    bookingStatuses: [
      { status: "PENDING", count: 486 },
      { status: "AWAITING_PAYMENT", count: 297 },
      { status: "CONFIRMED", count: 4382 },
      { status: "CHECKED_IN", count: 2011 },
      { status: "COMPLETED", count: 5964 },
      { status: "CANCELLED", count: 587 },
      { status: "NO_SHOW", count: 176 },
      { status: "REFUND_REQUESTED", count: 108 },
      { status: "REFUNDED", count: 92 },
      { status: "REJECTED", count: 74 },
    ],
  },
};
