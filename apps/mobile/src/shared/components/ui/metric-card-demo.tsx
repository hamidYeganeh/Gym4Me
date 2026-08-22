"use client";

import { ForkKnife } from "@repo/icons/ForkKnife";
import { Heart } from "@repo/icons/Heart";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { SleepZzz } from "@repo/icons/SleepZzz";
import { SmileHappy } from "@repo/icons/SmileHappy";
import { WaterDrop } from "@repo/icons/WaterDrop";
import { WeightScale } from "@repo/icons/WeightScale";
import { statsColors } from "@repo/theme/stats-colors";
import {
  MetricCard,
  type MetricCardChart,
  type MetricCardLayout,
} from "@repo/ui/cards/MetricCard";
import type { ReactNode } from "react";

export type MetricCardDemoLabels = {
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

type DemoMetric = {
  key: string;
  title: string;
  status: string;
  unit?: string;
  value: string;
  color: string;
  icon: ReactNode;
  chart: MetricCardChart;
};

/** Series matched to the MetricsCard reference mock. */
const WEIGHT_LINE = [64.8, 65.9, 65.2, 66.4, 65.1, 66.1, 65.7];
const HEART_STEP = [68, 74, 70, 78, 72, 80, 72.5];
const HYDRATION_STACKED = [
  [2, 2, 1],
  [3, 2, 2],
  [2, 1, 1],
  [3, 3, 2],
  [2, 2, 2],
  [3, 2, 1],
  [3, 3, 2],
];

function buildMetrics(labels: MetricCardDemoLabels): DemoMetric[] {
  return [
    {
      key: "weight",
      title: labels.weightTitle,
      status: labels.weightStatus,
      unit: labels.weightUnit,
      value: labels.weightValue,
      color: statsColors.orange,
      icon: <WeightScale size={18} />,
      chart: { type: "line", series: WEIGHT_LINE, curve: "monotone" },
    },
    {
      key: "blood-pressure",
      title: labels.bloodPressureTitle,
      status: labels.bloodPressureStatus,
      unit: labels.bloodPressureUnit,
      value: labels.bloodPressureValue,
      color: statsColors.purple,
      icon: <HeartEcg size={18} />,
      chart: {
        type: "range",
        series: [
          { low: 78, high: 122 },
          { low: 76, high: 118 },
          { low: 80, high: 125 },
          { low: 74, high: 120 },
          { low: 79, high: 128 },
          { low: 77, high: 124 },
          { low: 80, high: 120 },
        ],
      },
    },
    {
      key: "heart-rate",
      title: labels.heartRateTitle,
      status: labels.heartRateStatus,
      unit: labels.heartRateUnit,
      value: labels.heartRateValue,
      color: statsColors.red,
      icon: <Heart size={18} />,
      chart: { type: "line", series: HEART_STEP, curve: "step" },
    },
    {
      key: "sleep",
      title: labels.sleepTitle,
      status: labels.sleepStatus,
      unit: labels.sleepUnit,
      value: labels.sleepValue,
      color: statsColors.orange,
      icon: <SleepZzz size={18} />,
      chart: {
        type: "rings",
        series: [
          { value: 0.95, met: true },
          { value: 0.88, met: true },
          { value: 0.4, met: false },
          { value: 0.92, met: true },
          { value: 0.35, met: false },
          { value: 0.9, met: true },
          { value: 0.28, met: false },
        ],
      },
    },
    {
      key: "nutrition",
      title: labels.nutritionTitle,
      status: labels.nutritionStatus,
      unit: labels.nutritionUnit,
      value: labels.nutritionValue,
      color: "var(--success)",
      icon: <ForkKnife size={18} />,
      chart: { type: "dots", series: [3, 2, 3, 1, 3, 2, 3] },
    },
    {
      key: "hydration",
      title: labels.hydrationTitle,
      status: labels.hydrationStatus,
      unit: labels.hydrationUnit,
      value: labels.hydrationValue,
      color: statsColors.blue,
      icon: <WaterDrop size={18} />,
      chart: { type: "stacked", series: HYDRATION_STACKED },
    },
    {
      key: "mood",
      title: labels.moodTitle,
      status: labels.moodStatus,
      value: labels.moodValue,
      color: "var(--muted)",
      icon: <SmileHappy size={18} />,
      chart: {
        type: "moods",
        series: [
          "sad",
          "neutral",
          "happy",
          "overjoyed",
          "happy",
          "neutral",
          "overjoyed",
        ],
      },
    },
  ];
}

function MetricRow({
  metrics,
  variant,
  periodLabel,
}: {
  metrics: DemoMetric[];
  variant: MetricCardLayout;
  periodLabel: string;
}) {
  return (
    <div
      className={
        variant === "horizontal"
          ? "flex w-full flex-col items-start gap-3"
          : "flex w-full flex-row flex-wrap items-start gap-3"
      }
    >
      {metrics.map((metric) => (
        <MetricCard
          chart={metric.chart}
          color={metric.color}
          icon={metric.icon}
          key={`${variant}-${metric.key}`}
          periodLabel={periodLabel}
          status={metric.status}
          title={metric.title}
          unit={metric.unit}
          value={metric.value}
          variant={variant}
        />
      ))}
    </div>
  );
}

export function MetricCardDemo({ labels }: { labels: MetricCardDemoLabels }) {
  const metrics = buildMetrics(labels);

  return (
    <div className="flex w-full flex-col gap-8 rounded-[32px] bg-background p-3">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted">Horizontal</p>
        <MetricRow
          metrics={metrics}
          periodLabel={labels.periodLabel}
          variant="horizontal"
        />
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted">Vertical</p>
        <MetricRow
          metrics={metrics}
          periodLabel={labels.periodLabel}
          variant="vertical"
        />
      </div>
    </div>
  );
}
