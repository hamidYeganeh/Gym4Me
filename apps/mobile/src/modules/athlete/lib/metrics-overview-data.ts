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
};

/** Bar heights matched to the design mock. */
const WEIGHT_SERIES = [0.5, 0.3, 0.7, 0.85, 0.45, 0.25, 0.4];

export const METRICS_PROMO_IMAGE = "/demo/metrics-promo.png";

export const ATHLETE_METRICS: AthleteMetricDefinition[] = [
  {
    id: "heart-rate",
    href: "/athlete/metrics",
    color: statsColors.red,
    chart: {
      type: "line",
      series: [68, 74, 70, 78, 72, 80, 72],
    },
  },
  {
    id: "weight",
    href: "/athlete/metrics/weight",
    color: statsColors.orange,
    chart: {
      type: "bars",
      series: WEIGHT_SERIES,
    },
  },
  {
    id: "hydration",
    href: "/athlete/metrics",
    color: statsColors.blue,
    chart: {
      type: "bars",
      series: [0.55, 0.7, 0.45, 0.85, 0.6, 0.9, 0.75],
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
        { low: 80, high: 128 },
      ],
    },
  },
  {
    id: "sleep",
    href: "/athlete/metrics",
    color: statsColors.purple,
    chart: {
      type: "rings",
      series: [
        { value: 0.9, met: true },
        { value: 0.85, met: true },
        { value: 0.4, met: false },
        { value: 0.95, met: true },
        { value: 0.35, met: false },
        { value: 0.88, met: true },
        { value: 0.3, met: false },
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
        "happy",
        "overjoyed",
        "neutral",
        "happy",
        "sad",
        "happy",
        "overjoyed",
      ],
    },
  },
  {
    id: "steps",
    href: "/athlete/metrics",
    color: statsColors.orange,
    chart: {
      type: "bars",
      series: [0.4, 0.65, 0.5, 0.8, 0.55, 0.9, 0.7],
    },
  },
];
