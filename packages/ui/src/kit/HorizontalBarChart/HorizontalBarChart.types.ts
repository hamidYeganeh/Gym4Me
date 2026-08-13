export type HorizontalBarChartItem = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

export type HorizontalBarChartProps = {
  data: HorizontalBarChartItem[];
  color?: string;
  "aria-label"?: string;
  className?: string;
  formatValue?: (value: number) => string;
};
