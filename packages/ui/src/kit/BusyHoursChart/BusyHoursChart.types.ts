export type BusyHoursChartPoint = {
  /** Day label under the column (e.g. `ش` / `M`). */
  label: string;
  /**
   * Busyness 0–100.
   * Mapped to how many of the 3 dots light up (from the bottom).
   */
  value: number;
};

export type BusyHoursChartProps = {
  data: BusyHoursChartPoint[];
  /** Peak / busy accent for lit dots. Defaults to `var(--accent)`. */
  color?: string;
  /** Accessible label for the chart. */
  "aria-label"?: string;
  /** Header label next to the moon icon (e.g. "امروز"). */
  todayLabel?: string;
  /** @deprecated Kept for callers; unused in the week-dots chart. */
  peakLabel?: string;
  className?: string;
};
