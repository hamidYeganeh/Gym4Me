import type { MetricGoal, ProgressMetric } from "@repo/api";

export const HOME_STEPS_KEY = "steps";
export const HOME_ACTIVE_MINUTES_KEY = "walking_duration_min";

export function startOfLocalDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function lastSevenLocalDays(now = new Date()): Date[] {
  const start = startOfLocalDay(now);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() - (6 - index));
    return day;
  });
}

export function sumMetricForDay(
  items: ProgressMetric[],
  dayKey: string,
): number {
  return items
    .filter((item) => localDayKey(new Date(item.recordedAt)) === dayKey)
    .reduce((total, item) => total + item.value, 0);
}

export function weekSeries(items: ProgressMetric[], days: Date[]): number[] {
  return days.map((day) => sumMetricForDay(items, localDayKey(day)));
}

export function normalizeBarSeries(series: number[]): number[] {
  const peak = Math.max(...series, 0);
  if (peak <= 0) return series.map(() => 0);
  return series.map((value) => value / peak);
}

export function goalForMetric(
  goals: MetricGoal[],
  metricKey: string,
): MetricGoal | undefined {
  return goals.find(
    (goal) => goal.metricKey === metricKey && goal.status === "active",
  );
}

export function goalPercent(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(999, Math.round((value / target) * 100));
}

export function hasMetricSamples(items: ProgressMetric[]): boolean {
  return items.length > 0;
}
