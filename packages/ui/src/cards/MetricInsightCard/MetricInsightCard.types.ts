import type { ReactNode } from "react";

export type MetricInsightCardProps = {
  label: ReactNode;
  value: ReactNode;
  changeLabel: ReactNode;
  tip: ReactNode;
  /** Sparkline values (left → right). */
  series: number[];
  /** Defaults to danger/stats-red. */
  trendColor?: string;
  className?: string;
};
