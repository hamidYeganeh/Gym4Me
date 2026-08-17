import type { ReactNode } from "react";

export type DashboardChartPoint = {
  label: string;
  value: number;
};

export type DashboardQueueItem = {
  icon: ReactNode;
  title: string;
  description: string;
  count: string;
  tone: "warning" | "danger" | "neutral";
};

export type DashboardHomePrimaryGridSectionProps = {
  revenueTitle: string;
  revenueDescription: string;
  revenueTotal: string;
  revenueUnit: string;
  chartData: DashboardChartPoint[];
  chartAriaLabel: string;
  revenueEmptyLabel: string;
  queueTitle: string;
  queueDescription: string;
  queueTotal: string;
  queueItems: DashboardQueueItem[];
  queueActionLabel: string;
  onQueueAction: () => void;
  className?: string;
};
