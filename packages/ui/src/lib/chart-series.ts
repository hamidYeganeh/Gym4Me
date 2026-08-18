export const CHART_MARGIN = {
  compact: { top: 12, right: 8, bottom: 28, left: 8 },
  sparkline: { top: 4, right: 2, bottom: 4, left: 2 },
  horizontalBar: { top: 8, right: 16, bottom: 8, left: 88 },
} as const;

export type LabeledChartPoint = {
  label: string;
  value: number;
};

export type TimeSeriesPoint = LabeledChartPoint & {
  date: Date;
};

/** Map categorical `{ label, value }` rows onto a synthetic time domain for cartesian charts. */
export function toTimeSeries(
  data: readonly LabeledChartPoint[],
): TimeSeriesPoint[] {
  return data.map((point, index) => ({
    date: new Date(Date.UTC(2020, 0, 1 + index)),
    label: point.label,
    value: point.value,
  }));
}

export function toIndexedTimeSeries(
  series: readonly number[],
): { date: Date; index: number; value: number }[] {
  return series.map((value, index) => ({
    date: new Date(Date.UTC(2020, 0, 1 + index)),
    index,
    value,
  }));
}
