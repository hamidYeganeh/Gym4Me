export type BusyHoursChartPoint = {
  label: string;
  value: number;
};

export type BusyHoursChartProps = {
  data: BusyHoursChartPoint[];
  /** Peak / busy accent. Defaults to `var(--accent)`. */
  color?: string;
  /** Accessible label for the chart. */
  "aria-label"?: string;
  /** Optional caption under the peak hour (e.g. "شلوغ‌ترین ساعت"). */
  peakLabel?: string;
  className?: string;
};
