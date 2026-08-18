"use client";

import type { Key } from "@heroui/react/rac";
import { ToggleButton } from "@heroui/react/toggle-button";
import { ToggleButtonGroup } from "@heroui/react/toggle-button-group";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteWeightMetricsChartSectionVariants } from "./AthleteWeightMetricsChartSection.styles";
import type { AthleteWeightMetricsChartSectionProps } from "./AthleteWeightMetricsChartSection.types";

type PeriodKey = "1d" | "1w" | "1m" | "1y" | "all";

const CHART_VALUES: Record<PeriodKey, number[]> = {
  "1d": [67.2, 67.5, 67.1, 67.8, 67.4, 67.9],
  "1w": [68.1, 67.6, 67.9, 67.2, 67.5, 67.8, 67.4],
  "1m": [66.8, 67.4, 68.1, 67.2, 66.5, 67.6, 68.4, 69.2, 67.8, 66.9, 68.6, 69.4],
  "1y": [72.1, 71.4, 70.8, 70.2, 69.5, 68.9, 68.2, 67.8],
  all: [66.8, 67.4, 68.1, 67.2, 66.5, 67.6, 68.4, 69.2, 67.8, 66.9, 68.6, 69.4],
};

export function AthleteWeightMetricsChartSection({
  className,
}: AthleteWeightMetricsChartSectionProps) {
  const t = useTranslations("WeightMetrics");
  const styles = athleteWeightMetricsChartSectionVariants();
  const [period, setPeriod] = useState<PeriodKey>("all");

  const periods = useMemo(
    () =>
      [
        { id: "1d" as const, label: t("period1d") },
        { id: "1w" as const, label: t("period1w") },
        { id: "1m" as const, label: t("period1m") },
        { id: "1y" as const, label: t("period1y") },
        { id: "all" as const, label: t("periodAll") },
      ] as const,
    [t],
  );

  const chartLabels = useMemo((): string[] => {
    switch (period) {
      case "1d":
        return ["۶", "۹", "۱۲", "۱۵", "۱۸", "۲۱"];
      case "1w":
        return [
          t("weekdaySat"),
          t("weekdaySun"),
          t("weekdayMon"),
          t("weekdayTue"),
          t("weekdayWed"),
          t("weekdayThu"),
          t("weekdayFri"),
        ];
      case "1y":
        return [
          t("monthFarvardin"),
          t("monthOrdibehesht"),
          t("monthKhordad"),
          t("monthTir"),
          t("monthMordad"),
          t("monthShahrivar"),
          t("monthMehr"),
          t("monthAban"),
        ];
      case "1m":
      case "all":
      default:
        return Array.from({ length: 12 }, (_, index) =>
          toPersianDigits(12 + index),
        );
    }
  }, [period, t]);

  const chartData = useMemo(
    () =>
      CHART_VALUES[period].map((value, index) => ({
        label: chartLabels[index] ?? toPersianDigits(index + 1),
        value,
      })),
    [chartLabels, period],
  );

  return (
    <div className={styles.root({ className })}>
      <ToggleButtonGroup
        aria-label={t("periodGroupLabel")}
        className={styles.periodGroup()}
        disallowEmptySelection
        isDetached
        onSelectionChange={(keys: Set<Key>) => {
          const next = [...keys][0];
          if (
            next === "1d" ||
            next === "1w" ||
            next === "1m" ||
            next === "1y" ||
            next === "all"
          ) {
            setPeriod(next);
          }
        }}
        selectedKeys={new Set([period])}
        selectionMode="single"
        size="sm"
      >
        {periods.map((item) => (
          <ToggleButton
            className={styles.periodToggle()}
            id={item.id}
            key={item.id}
          >
            {item.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <AreaLineChart
        aria-label={t("chartLabel")}
        color="var(--success)"
        data={chartData}
      />
    </div>
  );
}
