"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { ForkKnife } from "@repo/icons/ForkKnife";
import { Heart } from "@repo/icons/Heart";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { ListTwoSquare } from "@repo/icons/ListTwoSquare";
import { SleepZzz } from "@repo/icons/SleepZzz";
import { SmileHappy } from "@repo/icons/SmileHappy";
import { StepSneaker } from "@repo/icons/StepSneaker";
import { WaterDrop } from "@repo/icons/WaterDrop";
import { WeightScale } from "@repo/icons/WeightScale";
import { MetricCard } from "@repo/ui/cards/MetricCard";
import type { ReactNode } from "react";
import type { AthleteMetricId } from "../../lib/metrics-overview-data";
import { athleteMetricsListSectionStyles as styles } from "./AthleteMetricsListSection.styles";
import type {
  AthleteMetricsListLabels,
  AthleteMetricsListSectionProps,
} from "./AthleteMetricsListSection.types";

function metricCopy(
  id: AthleteMetricId,
  labels: AthleteMetricsListLabels,
): {
  title: string;
  status: string;
  unit?: string;
  value: string;
  icon: ReactNode;
} {
  switch (id) {
    case "heart-rate":
      return {
        title: labels.heartRateTitle,
        status: labels.heartRateStatus,
        unit: labels.heartRateUnit,
        value: labels.heartRateValue,
        icon: <Heart size={18} />,
      };
    case "weight":
      return {
        title: labels.weightTitle,
        status: labels.weightStatus,
        unit: labels.weightUnit,
        value: labels.weightValue,
        icon: <WeightScale size={18} />,
      };
    case "hydration":
      return {
        title: labels.hydrationTitle,
        status: labels.hydrationStatus,
        unit: labels.hydrationUnit,
        value: labels.hydrationValue,
        icon: <WaterDrop size={18} />,
      };
    case "blood-pressure":
      return {
        title: labels.bloodPressureTitle,
        status: labels.bloodPressureStatus,
        unit: labels.bloodPressureUnit,
        value: labels.bloodPressureValue,
        icon: <HeartEcg size={18} />,
      };
    case "sleep":
      return {
        title: labels.sleepTitle,
        status: labels.sleepStatus,
        unit: labels.sleepUnit,
        value: labels.sleepValue,
        icon: <SleepZzz size={18} />,
      };
    case "nutrition":
      return {
        title: labels.nutritionTitle,
        status: labels.nutritionStatus,
        unit: labels.nutritionUnit,
        value: labels.nutritionValue,
        icon: <ForkKnife size={18} />,
      };
    case "mood":
      return {
        title: labels.moodTitle,
        status: labels.moodStatus,
        value: labels.moodValue,
        icon: <SmileHappy size={18} />,
      };
    case "steps":
      return {
        title: labels.stepsTitle,
        status: labels.stepsStatus,
        unit: labels.stepsUnit,
        value: labels.stepsValue,
        icon: <StepSneaker size={18} />,
      };
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function AthleteMetricsListSection({
  sectionTitle,
  viewLabel,
  viewAriaLabel,
  labels,
  metrics,
  onMetricPress,
  onViewPress,
}: AthleteMetricsListSectionProps) {
  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <Typography className={styles.title} type="h4" weight="semibold">
          {sectionTitle}
        </Typography>
        <Button
          aria-label={viewAriaLabel}
          className={styles.viewButton}
          onPress={onViewPress}
          variant="ghost"
        >
          <ListTwoSquare aria-hidden className={styles.viewIcon} size={16} />
          <span>{viewLabel}</span>
          <ChevronDown aria-hidden className={styles.chevron} size={14} />
        </Button>
      </div>

      <div className={styles.list}>
        {metrics.map((metric) => {
          const copy = metricCopy(metric.id, labels);
          return (
            <MetricCard
              chart={metric.chart}
              color={metric.color}
              icon={copy.icon}
              key={metric.id}
              onPress={
                onMetricPress ? () => onMetricPress(metric.href) : undefined
              }
              periodLabel={labels.periodLabel}
              status={metric.status ?? copy.status}
              title={copy.title}
              unit={metric.unit ?? copy.unit}
              value={metric.value ?? copy.value}
            />
          );
        })}
      </div>
    </section>
  );
}
