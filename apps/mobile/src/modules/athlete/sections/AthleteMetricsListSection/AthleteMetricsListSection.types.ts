import type { AthleteMetricDefinition } from "../../lib/metrics-overview-data";

export type AthleteMetricsListLabels = {
  periodLabel: string;
  heartRateTitle: string;
  heartRateStatus: string;
  heartRateUnit: string;
  heartRateValue: string;
  weightTitle: string;
  weightStatus: string;
  weightUnit: string;
  weightValue: string;
  hydrationTitle: string;
  hydrationStatus: string;
  hydrationUnit: string;
  hydrationValue: string;
  bloodPressureTitle: string;
  bloodPressureStatus: string;
  bloodPressureUnit: string;
  bloodPressureValue: string;
  sleepTitle: string;
  sleepStatus: string;
  sleepUnit: string;
  sleepValue: string;
  nutritionTitle: string;
  nutritionStatus: string;
  nutritionUnit: string;
  nutritionValue: string;
  moodTitle: string;
  moodStatus: string;
  moodValue: string;
  stepsTitle: string;
  stepsStatus: string;
  stepsUnit: string;
  stepsValue: string;
};

export type AthleteMetricsListSectionProps = {
  sectionTitle: string;
  viewLabel: string;
  viewAriaLabel: string;
  labels: AthleteMetricsListLabels;
  metrics: AthleteMetricDefinition[];
  onMetricPress?: (href: string) => void;
  onViewPress?: () => void;
};
