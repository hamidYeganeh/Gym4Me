export type AreaLineChartPoint = {
  label: string;
  value: number;
};

export type AreaLineChartProps = {
  data: AreaLineChartPoint[];
  /** Stroke / marker color. Defaults to `--chart-line-primary` (accent). */
  color?: string;
  /** Accessible label for the chart. */
  "aria-label"?: string;
  className?: string;
};
