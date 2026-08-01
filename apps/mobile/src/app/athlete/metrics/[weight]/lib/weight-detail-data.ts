import {
  WEIGHT_HISTORY,
  type WeightHistoryEntry,
} from "./weight-history-data";

export type WeightDetailMetrics = {
  goalKg: number;
  bmi: number;
  changePercent: number;
  weeklyAverage: string;
  monthlyAverage: string;
  trendPercent: number;
};

export type WeightDetail = WeightHistoryEntry & {
  /** ISO date used for full date formatting when dateKey is absolute. */
  recordedAt: string;
  metrics: WeightDetailMetrics;
};

const DEFAULT_METRICS: WeightDetailMetrics = {
  goalKg: 65,
  bmi: 12.8,
  changePercent: 5,
  weeklyAverage: "۳ کیلومتر",
  monthlyAverage: "۱۶۰",
  trendPercent: -15,
};

function resolveRecordedAt(entry: WeightHistoryEntry): string {
  if (entry.dateKey === "today") {
    return "2028-06-23";
  }
  if (entry.dateKey === "yesterday") {
    return "2028-06-22";
  }
  return entry.dateKey;
}

export function getWeightDetail(metricId: string): WeightDetail | null {
  const entry = WEIGHT_HISTORY.find((item) => item.id === metricId);
  if (!entry) return null;

  return {
    ...entry,
    recordedAt: resolveRecordedAt(entry),
    metrics: {
      ...DEFAULT_METRICS,
      // Slight per-entry variation for demo realism
      bmi: Number((12.4 + entry.kg * 0.005).toFixed(1)),
      changePercent: entry.showAlert ? 5 : entry.status === "goalCompleted" ? 2 : -1,
    },
  };
}

export function getAllWeightDetailParams(weight: string) {
  return WEIGHT_HISTORY.map((entry) => ({
    weight,
    metricId: entry.id,
  }));
}
