export type DonutChartItem = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

export type DonutChartProps = {
  data: DonutChartItem[];
  "aria-label"?: string;
  className?: string;
  formatValue?: (value: number) => string;
};
