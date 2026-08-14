import type { MetricType } from "@repo/api";

export type SelfTrackingMetricKey =
  | "weight_kg"
  | "water_ml"
  | "steps"
  | "walking_distance_km"
  | "walking_duration_min"
  | "sleep_duration_min"
  | "sleep_quality"
  | (string & {});

export type SelfTrackingMetric = {
  key: string;
  label: string;
  unit: string;
  unitLabel: string;
  hint: string;
  min: number;
  max: number;
  step: number;
};

export const SELF_TRACKING_METRICS: readonly SelfTrackingMetric[] = [
  {
    key: "water_ml",
    label: "آب مصرفی",
    unit: "ml",
    unitLabel: "میلی‌لیتر",
    hint: "مثلاً ۲۵۰ برای یک لیوان",
    min: 0,
    max: 20_000,
    step: 50,
  },
  {
    key: "steps",
    label: "تعداد قدم",
    unit: "steps",
    unitLabel: "قدم",
    hint: "مجموع قدم‌های امروز",
    min: 0,
    max: 200_000,
    step: 1,
  },
  {
    key: "walking_distance_km",
    label: "مسافت پیاده‌روی",
    unit: "km",
    unitLabel: "کیلومتر",
    hint: "مثلاً ۳٫۵ کیلومتر",
    min: 0,
    max: 500,
    step: 0.1,
  },
  {
    key: "walking_duration_min",
    label: "زمان پیاده‌روی",
    unit: "min",
    unitLabel: "دقیقه",
    hint: "مدت پیاده‌روی امروز",
    min: 0,
    max: 1_440,
    step: 1,
  },
  {
    key: "weight_kg",
    label: "وزن",
    unit: "kg",
    unitLabel: "کیلوگرم",
    hint: "مثلاً ۷۲٫۵ کیلوگرم",
    min: 1,
    max: 500,
    step: 0.1,
  },
  {
    key: "sleep_duration_min",
    label: "مدت خواب",
    unit: "min",
    unitLabel: "دقیقه",
    hint: "مثلاً ۴۲۰ برای ۷ ساعت",
    min: 0,
    max: 1_440,
    step: 5,
  },
  {
    key: "sleep_quality",
    label: "کیفیت خواب",
    unit: "score",
    unitLabel: "از ۵",
    hint: "۱ خیلی ضعیف تا ۵ عالی",
    min: 1,
    max: 5,
    step: 1,
  },
] as const;

export const PERSONAL_RECORD_TYPES = [
  { key: "squat_1rm", label: "اسکوات یک تکرار", unit: "کیلوگرم" },
  { key: "bench_press_1rm", label: "پرس سینه یک تکرار", unit: "کیلوگرم" },
  { key: "deadlift_1rm", label: "ددلیفت یک تکرار", unit: "کیلوگرم" },
  { key: "running_5k_sec", label: "رکورد دو ۵ کیلومتر", unit: "ثانیه" },
] as const;

export function getSelfTrackingMetric(key: string) {
  return SELF_TRACKING_METRICS.find((item) => item.key === key);
}

const UNIT_LABELS: Record<string, string> = {
  ml: "میلی‌لیتر",
  steps: "قدم",
  km: "کیلومتر",
  min: "دقیقه",
  kg: "کیلوگرم",
  score: "از ۵",
  bpm: "ضربان",
};

/** Prefer API catalog; fall back to local display map for labels/icons. */
export function mapMetricTypesToCatalog(
  types: MetricType[],
): SelfTrackingMetric[] {
  const active = types
    .filter((type) => type.status === "active" && type.valueKind === "number")
    .sort((a, b) => a.sortHint - b.sortHint || a.key.localeCompare(b.key));

  if (active.length === 0) {
    return [...SELF_TRACKING_METRICS];
  }

  return active.map((type) => {
    const local = getSelfTrackingMetric(type.key);
    const unit = type.unit ?? type.canonicalUnit ?? local?.unit ?? "";
    return {
      key: type.key,
      label: local?.label ?? type.name,
      unit,
      unitLabel: local?.unitLabel ?? UNIT_LABELS[unit] ?? unit,
      hint: local?.hint ?? type.name,
      min: type.validation?.min ?? local?.min ?? 0,
      max: type.validation?.max ?? local?.max ?? 1_000_000,
      step: type.validation?.step ?? local?.step ?? 1,
    };
  });
}
