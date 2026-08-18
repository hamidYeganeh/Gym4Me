export type FunnelChartItem = {
  label: string;
  value: number;
  color?: string;
};

export type FunnelChartProps = {
  data: FunnelChartItem[];
  color?: string;
  "aria-label"?: string;
  className?: string;
  formatValue?: (value: number) => string;
  formatPercentage?: (pct: number) => string;
};
