import type { ReactNode } from "react";

export type MetricMood =
  | "overjoyed"
  | "happy"
  | "neutral"
  | "sad"
  | "depressed";

export type MetricCardLineChart = {
  type: "line";
  /** Daily values (typically 7). */
  series: number[];
  color?: string;
};

export type MetricCardBarsChart = {
  type: "bars";
  /** Daily fill amounts 0–1 (or any scale; normalized to max). */
  series: number[];
  color?: string;
  /** Background track color. Defaults to theme `bg-default`. */
  trackColor?: string;
};

export type MetricCardRangeChart = {
  type: "range";
  /** Daily low/high pairs (e.g. diastolic/systolic). */
  series: Array<{ low: number; high: number }>;
  color?: string;
  trackColor?: string;
};

export type MetricCardRingsChart = {
  type: "rings";
  /** Daily progress 0–1. `met` drives the check / x above each ring. */
  series: Array<{ value: number; met?: boolean }>;
  color?: string;
};

export type MetricCardDotsChart = {
  type: "dots";
  /** Per day: how many of 3 dots are filled (0–3). */
  series: number[];
  color?: string;
};

export type MetricCardMoodsChart = {
  type: "moods";
  series: Array<MetricMood | null>;
};

export type MetricCardChart =
  | MetricCardLineChart
  | MetricCardBarsChart
  | MetricCardRangeChart
  | MetricCardRingsChart
  | MetricCardDotsChart
  | MetricCardMoodsChart;

export type MetricCardProps = {
  title: ReactNode;
  icon: ReactNode;
  /** Primary reading — number or short text (e.g. "Happy"). */
  value: ReactNode;
  unit?: ReactNode;
  /** Status line under the value (e.g. "On Track"). */
  status?: ReactNode;
  /** Trailing header label, defaults to "Today". */
  periodLabel?: ReactNode;
  /** Weekday labels under the chart. Defaults to M T W T F S S. */
  dayLabels?: readonly string[];
  chart: MetricCardChart;
  /**
   * Accent for icon badge + chart fills.
   * Prefer theme tokens (`statsColors.*` / `var(--stats-orange)`).
   */
  color?: string;
  onPress?: () => void;
  className?: string;
};
