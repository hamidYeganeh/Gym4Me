import type { HTMLAttributes, ReactNode } from "react";

export type StatsCardChart = "line" | "bar";

type StatsCardBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children" | "color"
> & {
  /** Metric label shown in the header (e.g. "Hydration", "Score"). */
  title: ReactNode;
  /** Large numeric value in the footer (e.g. 781, 88). */
  value: ReactNode;
  /** Unit next to the value (e.g. "ml", "%"). */
  unit?: ReactNode;
  /**
   * Icon in the top-end corner.
   * Defaults to `WaterDrop` for `line`, `Plus` for `bar`.
   */
  icon?: ReactNode;
  /**
   * Data values for the chart.
   * Line: plotted as a smooth spline. Bar: one pill bar per value.
   */
  series: number[];
  /**
   * Card background color.
   * Defaults to `var(--stats-blue)` for `line`, `var(--stats-orange)` for `bar`.
   * Prefer theme tokens: `var(--stats-red|blue|yellow|purple|orange)`.
   */
  color?: string;
  /** Foreground (text / chart) color. Defaults to `var(--stats-foreground)`. */
  foregroundColor?: string;
  /** Extra classes for the chart region. */
  chartClassName?: string;
};

export type StatsCardLineProps = StatsCardBaseProps & {
  /** Smooth dual-line trend chart (default). */
  chart?: "line";
  /**
   * Optional comparison series plotted behind the primary line
   * (lighter stroke), e.g. previous period.
   */
  comparisonSeries?: number[];
};

export type StatsCardBarProps = StatsCardBaseProps & {
  /** Vertical pill bar chart with focus falloff from the highlight bar. */
  chart: "bar";
  /**
   * Index of the emphasized (brightest) bar.
   * Defaults to the middle bar.
   */
  highlightIndex?: number;
};

export type StatsCardProps = StatsCardLineProps | StatsCardBarProps;
