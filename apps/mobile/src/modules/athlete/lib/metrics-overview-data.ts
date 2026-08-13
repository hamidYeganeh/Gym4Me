import { statsColors } from "@repo/theme";
import type { MetricCardChart } from "@repo/ui/cards/MetricCard";

export type AthleteMetricId =
  | "heart-rate"
  | "weight"
  | "hydration"
  | "blood-pressure"
  | "sleep"
  | "nutrition"
  | "mood"
  | "steps";

export type AthleteMetricDefinition = {
  id: AthleteMetricId;
  href: string;
  color: string;
  chart: MetricCardChart;
  /** Live API values override the legacy design-copy defaults when available. */
  value?: string;
  unit?: string;
  status?: string;
};

/** Series matched to the MetricsCard reference mock. */
const WEIGHT_LINE = [64.8, 65.9, 65.2, 66.4, 65.1, 66.1, 65.7];
const HEART_STEP = [68, 74, 70, 78, 72, 80, 72.5];
const HYDRATION_STACKED = [
  [2, 2, 1],
  [3, 2, 2],
  [2, 1, 1],
  [3, 3, 2],
  [2, 2, 2],
  [3, 2, 1],
  [3, 3, 2],
];

export const METRICS_PROMO_IMAGE = "/demo/metrics-promo.png";

export const ATHLETE_METRICS: AthleteMetricDefinition[] = [
  {
    id: "heart-rate",
    href: "/athlete/metrics",
    color: statsColors.red,
    chart: {
      type: "line",
      series: HEART_STEP,
      curve: "step",
    },
  },
  {
    id: "weight",
    href: "/athlete/metrics/log?metric=weight_kg",
    color: statsColors.orange,
    chart: {
      type: "line",
      series: WEIGHT_LINE,
      curve: "monotone",
    },
  },
  {
    id: "hydration",
    href: "/athlete/metrics/log?metric=water_ml",
    color: statsColors.blue,
    chart: {
      type: "stacked",
      series: HYDRATION_STACKED,
    },
  },
  {
    id: "blood-pressure",
    href: "/athlete/metrics",
    color: statsColors.purple,
    chart: {
      type: "range",
      series: [
        { low: 78, high: 122 },
        { low: 76, high: 118 },
        { low: 80, high: 125 },
        { low: 74, high: 120 },
        { low: 79, high: 128 },
        { low: 77, high: 124 },
        { low: 80, high: 120 },
      ],
    },
  },
  {
    id: "sleep",
    href: "/athlete/metrics/log?metric=sleep_duration_min",
    color: statsColors.orange,
    chart: {
      type: "rings",
      series: [
        { value: 0.95, met: true },
        { value: 0.88, met: true },
        { value: 0.4, met: false },
        { value: 0.92, met: true },
        { value: 0.35, met: false },
        { value: 0.9, met: true },
        { value: 0.28, met: false },
      ],
    },
  },
  {
    id: "nutrition",
    href: "/athlete/metrics",
    color: "var(--success)",
    chart: {
      type: "dots",
      series: [3, 2, 3, 1, 3, 2, 3],
    },
  },
  {
    id: "mood",
    href: "/athlete/metrics",
    color: "var(--muted)",
    chart: {
      type: "moods",
      series: [
        "sad",
        "neutral",
        "happy",
        "overjoyed",
        "happy",
        "neutral",
        "overjoyed",
      ],
    },
  },
  {
    id: "steps",
    href: "/athlete/metrics/log?metric=steps",
    color: statsColors.orange,
    chart: {
      type: "bars",
      series: [0.4, 0.65, 0.5, 0.8, 0.55, 0.9, 0.7],
    },
  },
];
