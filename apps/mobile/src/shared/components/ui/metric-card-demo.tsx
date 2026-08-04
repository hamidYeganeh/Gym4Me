"use client";

import { HeartEcg } from "@repo/icons/HeartEcg";
import { Leaf } from "@repo/icons/Leaf";
import { SleepZzz } from "@repo/icons/SleepZzz";
import { SmileHappy } from "@repo/icons/SmileHappy";
import { StepSneaker } from "@repo/icons/StepSneaker";
import { WaterDrop } from "@repo/icons/WaterDrop";
import { WaterGlassMedium } from "@repo/icons/WaterGlassMedium";
import { WeightScale } from "@repo/icons/WeightScale";
import { statsColors } from "@repo/theme";
import { MetricCard } from "@repo/ui/cards/MetricCard";

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

/** Bar heights matched to the Weight reference mock. */
const WEIGHT_SERIES = [0.5, 0.3, 0.7, 0.85, 0.45, 0.25, 0.4];

export function MetricCardDemo({ labels }: { labels: MetricCardDemoLabels }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-[32px] bg-background p-3">
      <MetricCard
        chart={{
          type: "line",
          series: [68, 74, 70, 78, 72, 80, 72],
        }}
        color={statsColors.red}
        icon={<HeartEcg size={18} />}
        periodLabel={labels.periodLabel}
        status={labels.heartRateStatus}
        title={labels.heartRateTitle}
        unit={labels.heartRateUnit}
        value={labels.heartRateValue}
      />
      <MetricCard
        chart={{
          type: "bars",
          series: WEIGHT_SERIES,
        }}
        color={statsColors.orange}
        icon={<WeightScale size={18} />}
        periodLabel={labels.periodLabel}
        status={labels.weightStatus}
        title={labels.weightTitle}
        unit={labels.weightUnit}
        value={labels.weightValue}
      />
      <MetricCard
        chart={{
          type: "bars",
          series: [0.55, 0.7, 0.45, 0.85, 0.6, 0.9, 0.75],
        }}
        color={statsColors.blue}
        icon={<WaterGlassMedium size={18} />}
        periodLabel={labels.periodLabel}
        status={labels.hydrationStatus}
        title={labels.hydrationTitle}
        unit={labels.hydrationUnit}
        value={labels.hydrationValue}
      />
      <MetricCard
        chart={{
          type: "range",
          series: [
            { low: 78, high: 122 },
            { low: 76, high: 118 },
            { low: 80, high: 125 },
            { low: 74, high: 120 },
            { low: 79, high: 128 },
            { low: 77, high: 124 },
            { low: 80, high: 128 },
          ],
        }}
        color={statsColors.purple}
        icon={<WaterDrop size={18} />}
        periodLabel={labels.periodLabel}
        status={labels.bloodPressureStatus}
        title={labels.bloodPressureTitle}
        unit={labels.bloodPressureUnit}
        value={labels.bloodPressureValue}
      />
      <MetricCard
        chart={{
          type: "rings",
          series: [
            { value: 0.9, met: true },
            { value: 0.85, met: true },
            { value: 0.4, met: false },
            { value: 0.95, met: true },
            { value: 0.35, met: false },
            { value: 0.88, met: true },
            { value: 0.3, met: false },
          ],
        }}
        color={statsColors.purple}
        icon={<SleepZzz size={18} />}
        periodLabel={labels.periodLabel}
        status={labels.sleepStatus}
        title={labels.sleepTitle}
        unit={labels.sleepUnit}
        value={labels.sleepValue}
      />
      <MetricCard
        chart={{
          type: "dots",
          series: [3, 2, 3, 1, 3, 2, 3],
        }}
        color="var(--success)"
        icon={<Leaf size={18} />}
        periodLabel={labels.periodLabel}
        status={labels.nutritionStatus}
        title={labels.nutritionTitle}
        unit={labels.nutritionUnit}
        value={labels.nutritionValue}
      />
      <MetricCard
        chart={{
          type: "moods",
          series: [
            "happy",
            "overjoyed",
            "neutral",
            "happy",
            "sad",
            "happy",
            "overjoyed",
          ],
        }}
        color="var(--muted)"
        icon={<SmileHappy size={18} />}
        periodLabel={labels.periodLabel}
        status={labels.moodStatus}
        title={labels.moodTitle}
        value={labels.moodValue}
      />
      <MetricCard
        chart={{
          type: "bars",
          series: [0.4, 0.65, 0.5, 0.8, 0.55, 0.9, 0.7],
        }}
        color={statsColors.orange}
        icon={<StepSneaker size={18} />}
        periodLabel={labels.periodLabel}
        status={labels.stepsStatus}
        title={labels.stepsTitle}
        unit={labels.stepsUnit}
        value={labels.stepsValue}
      />
    </div>
  );
}
