import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type CoachAnalyticsPeriod = "week" | "month" | "quarter";

export type CoachAnalyticsKpis = {
  sessionsSeries: number[];
  sessionsValue: string;
  activeClientsSeries: number[];
  activeClientsValue: string;
  retentionSeries: number[];
  retentionComparisonSeries: number[];
  retentionValue: string;
  cancellationsSeries: number[];
  cancellationsValue: string;
};

export type CoachAnalyticsBusyHour = {
  id: string;
  label: string;
  percent: number;
  valueLabel: string;
};

export type CoachAnalyticsReview = {
  id: string;
  reviewer: string;
  avatar: string;
  dateLabel: string;
  title: string;
  content: string;
  rating: number;
};

export type CoachAnalyticsDataset = {
  kpis: CoachAnalyticsKpis;
  sessionsTrend: { label: string; value: number }[];
  busiestHours: CoachAnalyticsBusyHour[];
};

export type CoachAnalyticsData = {
  periods: Record<CoachAnalyticsPeriod, CoachAnalyticsDataset>;
  ratingAverage: string;
  ratingCountLabel: string;
  starDistribution: { stars: number; percent: number }[];
  recentReviews: CoachAnalyticsReview[];
};

const WEEK_DATASET: CoachAnalyticsDataset = {
  kpis: {
    sessionsSeries: [4, 6, 5, 7, 8, 6, 9],
    sessionsValue: "۴۵",
    activeClientsSeries: [14, 15, 15, 16, 17, 17, 18],
    activeClientsValue: "۱۸",
    retentionSeries: [78, 80, 82, 81, 84, 86, 88],
    retentionComparisonSeries: [72, 74, 75, 76, 77, 78, 80],
    retentionValue: "۸۸",
    cancellationsSeries: [1, 0, 2, 1, 0, 1, 1],
    cancellationsValue: "۶",
  },
  sessionsTrend: [
    { label: "شنبه", value: 4 },
    { label: "یکشنبه", value: 6 },
    { label: "دوشنبه", value: 5 },
    { label: "سه‌شنبه", value: 7 },
    { label: "چهارشنبه", value: 8 },
    { label: "پنجشنبه", value: 6 },
    { label: "جمعه", value: 9 },
  ],
  busiestHours: [
    { id: "h1", label: "۷ تا ۹ صبح", percent: 85, valueLabel: "۱۲ جلسه" },
    { id: "h2", label: "۹ تا ۱۲ ظهر", percent: 40, valueLabel: "۶ جلسه" },
    { id: "h3", label: "۱۲ تا ۱۵", percent: 25, valueLabel: "۴ جلسه" },
    { id: "h4", label: "۱۵ تا ۱۸", percent: 60, valueLabel: "۹ جلسه" },
    { id: "h5", label: "۱۸ تا ۲۱ شب", percent: 100, valueLabel: "۱۴ جلسه" },
  ],
};

const MONTH_DATASET: CoachAnalyticsDataset = {
  kpis: {
    sessionsSeries: [38, 42, 47, 52],
    sessionsValue: "۱۷۹",
    activeClientsSeries: [15, 16, 17, 18],
    activeClientsValue: "۱۸",
    retentionSeries: [76, 79, 83, 86],
    retentionComparisonSeries: [70, 72, 75, 77],
    retentionValue: "۸۶",
    cancellationsSeries: [5, 3, 4, 2],
    cancellationsValue: "۱۴",
  },
  sessionsTrend: [
    { label: "هفته ۱", value: 38 },
    { label: "هفته ۲", value: 42 },
    { label: "هفته ۳", value: 47 },
    { label: "هفته ۴", value: 52 },
  ],
  busiestHours: [
    { id: "h1", label: "۷ تا ۹ صبح", percent: 78, valueLabel: "۴۶ جلسه" },
    { id: "h2", label: "۹ تا ۱۲ ظهر", percent: 45, valueLabel: "۲۷ جلسه" },
    { id: "h3", label: "۱۲ تا ۱۵", percent: 30, valueLabel: "۱۸ جلسه" },
    { id: "h4", label: "۱۵ تا ۱۸", percent: 62, valueLabel: "۳۷ جلسه" },
    { id: "h5", label: "۱۸ تا ۲۱ شب", percent: 100, valueLabel: "۵۹ جلسه" },
  ],
};

const QUARTER_DATASET: CoachAnalyticsDataset = {
  kpis: {
    sessionsSeries: [142, 168, 179],
    sessionsValue: "۴۸۹",
    activeClientsSeries: [12, 15, 18],
    activeClientsValue: "۱۸",
    retentionSeries: [72, 80, 86],
    retentionComparisonSeries: [66, 70, 74],
    retentionValue: "۸۶",
    cancellationsSeries: [19, 16, 14],
    cancellationsValue: "۴۹",
  },
  sessionsTrend: [
    { label: "تیر", value: 142 },
    { label: "مرداد", value: 168 },
    { label: "شهریور", value: 179 },
  ],
  busiestHours: [
    { id: "h1", label: "۷ تا ۹ صبح", percent: 74, valueLabel: "۱۲۸ جلسه" },
    { id: "h2", label: "۹ تا ۱۲ ظهر", percent: 48, valueLabel: "۸۳ جلسه" },
    { id: "h3", label: "۱۲ تا ۱۵", percent: 33, valueLabel: "۵۷ جلسه" },
    { id: "h4", label: "۱۵ تا ۱۸", percent: 66, valueLabel: "۱۱۴ جلسه" },
    { id: "h5", label: "۱۸ تا ۲۱ شب", percent: 100, valueLabel: "۱۷۳ جلسه" },
  ],
};

export const COACH_ANALYTICS: CoachAnalyticsData = {
  periods: {
    week: WEEK_DATASET,
    month: MONTH_DATASET,
    quarter: QUARTER_DATASET,
  },
  ratingAverage: "۴٫۸",
  ratingCountLabel: "از ۱۲۶ نظر",
  starDistribution: [
    { stars: 5, percent: 82 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 4 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ],
  recentReviews: [
    {
      id: "r1",
      reviewer: "نگار احمدی",
      avatar: PLACEHOLDER_IMAGE,
      dateLabel: "۲۰ مرداد ۱۴۰۳",
      title: "برنامه‌ریزی فوق‌العاده",
      content:
        "بعد از سه ماه تمرین با ایشان به هدفی رسیدم که دو سال دنبالش بودم. برنامه‌ها دقیق و پیگیری‌ها منظم است.",
      rating: 5,
    },
    {
      id: "r2",
      reviewer: "حسین موسوی",
      avatar: PLACEHOLDER_IMAGE,
      dateLabel: "۱۴ مرداد ۱۴۰۳",
      title: "مربی حرفه‌ای و دلسوز",
      content:
        "فرم حرکات را با حوصله اصلاح می‌کند و همیشه در دسترس است. فقط گاهی جلسات کمی دیر شروع می‌شود.",
      rating: 4,
    },
  ],
};
