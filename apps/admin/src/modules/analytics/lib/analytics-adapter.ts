import type { AdminAnalyticsOverview, DailyPoint } from "@repo/api";
import type {
  AnalyticsDataset,
  AnalyticsPeriod,
  AnalyticsTrendPoint,
} from "./analytics-data";

/** Ledger amounts are rials; KPI cards show million tomans. */
const RIALS_PER_MILLION_TOMAN = 10_000_000;

const FA_WEEKDAY = new Intl.DateTimeFormat("fa-IR", { weekday: "long" });

function weekdayLabel(date: string): string {
  return FA_WEEKDAY.format(new Date(`${date}T12:00:00Z`));
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Splits the (up to 30-day) window into 4 sequential buckets. */
function bucketize(points: DailyPoint[]): number[][] {
  const bucketCount = 4;
  const size = Math.max(1, Math.ceil(points.length / bucketCount));
  const buckets: number[][] = [];
  for (let i = 0; i < points.length; i += size) {
    buckets.push(points.slice(i, i + size).map((point) => point.value));
  }
  return buckets;
}

const BUCKET_LABELS = ["هفته ۱", "هفته ۲", "هفته ۳", "هفته ۴"];

function toMillionToman(rials: number): number {
  return Math.round((rials / RIALS_PER_MILLION_TOMAN) * 10) / 10;
}

/**
 * Maps the real analytics overview onto the screen dataset. The API exposes a
 * 30-day daily window, so "week" uses the last 7 days and "month"/"quarter"
 * both aggregate the full available window. Sections without a backing
 * endpoint (acquisition, funnel, marketplace, retention, booking statuses)
 * keep the sample fixture.
 */
export function overviewToDataset(
  overview: AdminAnalyticsOverview,
  period: AnalyticsPeriod,
  fallback: AnalyticsDataset,
): AnalyticsDataset {
  const { revenueDaily, signupsDaily, bookingsDaily } = overview.series;

  let signupSeries: number[];
  let bookingSeries: number[];
  let revenueSeriesRials: number[];
  let labels: string[];

  if (period === "week") {
    const window = 7;
    const revenue = revenueDaily.slice(-window);
    signupSeries = signupsDaily.slice(-window).map((point) => point.value);
    bookingSeries = bookingsDaily.slice(-window).map((point) => point.value);
    revenueSeriesRials = revenue.map((point) => point.value);
    labels = revenue.map((point) => weekdayLabel(point.date));
  } else {
    signupSeries = bucketize(signupsDaily).map(sum);
    bookingSeries = bucketize(bookingsDaily).map(sum);
    revenueSeriesRials = bucketize(revenueDaily).map(sum);
    labels = BUCKET_LABELS.slice(0, revenueSeriesRials.length);
  }

  const revenueSeries = revenueSeriesRials.map(toMillionToman);
  const signupTotal = sum(signupSeries);
  const bookingTotal = sum(bookingSeries);

  const conversionSeries = signupSeries.map((signups, index) =>
    signups > 0
      ? Math.round(((bookingSeries[index] ?? 0) / signups) * 1000) / 10
      : 0,
  );
  const conversionRate =
    signupTotal > 0
      ? Math.round((bookingTotal / signupTotal) * 1000) / 10
      : 0;

  const toTrend = (values: number[]): AnalyticsTrendPoint[] =>
    values.map((value, index) => ({
      label: labels[index] ?? "",
      value,
    }));

  return {
    ...fallback,
    kpis: [
      { id: "activeUsers", value: signupTotal, series: signupSeries },
      { id: "bookings", value: bookingTotal, series: bookingSeries },
      {
        id: "grossRevenue",
        value: toMillionToman(sum(revenueSeriesRials)),
        series: revenueSeries,
      },
      { id: "conversionRate", value: conversionRate, series: conversionSeries },
    ],
    signupTrend: toTrend(signupSeries),
    revenueTrend: toTrend(revenueSeries),
  };
}
