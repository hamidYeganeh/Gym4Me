import type { ReactNode } from "react";

export type DashboardMetricItem = {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "accent" | "warning" | "success" | "neutral";
};

export type DashboardHomeMetricsSectionProps = {
  metrics: DashboardMetricItem[];
  className?: string;
};
