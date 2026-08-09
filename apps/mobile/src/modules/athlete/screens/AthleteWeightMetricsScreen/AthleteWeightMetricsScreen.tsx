"use client";

import type { Key } from "@heroui/react";
import {
  Button,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { ChartBar1 } from "@repo/icons/ChartBar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { WeightScale } from "@repo/icons/WeightScale";
import { MetricGoalCard } from "@repo/ui/cards/MetricGoalCard";
import { MetricHistoryItem } from "@repo/ui/cards/MetricHistoryItem";
import { MetricInsightCard } from "@repo/ui/cards/MetricInsightCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { AreaLineChart } from "@repo/ui/kit/AreaLineChart";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  formatTimeFa,
  formatWeightKg,
  toPersianDigits,
} from "@/modules/athlete/lib/weight/format";
import { getRecentWeightHistory } from "@/modules/athlete/lib/weight/weight-history-data";
import type { AthleteWeightMetricsScreenProps } from "./AthleteWeightMetricsScreen.types";

type PeriodKey = "1d" | "1w" | "1m" | "1y" | "all";

const CHART_VALUES: Record<PeriodKey, number[]> = {
  "1d": [67.2, 67.5, 67.1, 67.8, 67.4, 67.9],
  "1w": [68.1, 67.6, 67.9, 67.2, 67.5, 67.8, 67.4],
  "1m": [66.8, 67.4, 68.1, 67.2, 66.5, 67.6, 68.4, 69.2, 67.8, 66.9, 68.6, 69.4],
  "1y": [72.1, 71.4, 70.8, 70.2, 69.5, 68.9, 68.2, 67.8],
  all: [66.8, 67.4, 68.1, 67.2, 66.5, 67.6, 68.4, 69.2, 67.8, 66.9, 68.6, 69.4],
};

const INSIGHT_SERIES = [42, 40, 38, 36, 35, 33, 32.8];

const periodToggleClass = [
  "min-w-0 flex-1 rounded-full border-0 bg-default px-2 py-2",
  "text-xs font-medium text-foreground shadow-none",
  "data-[selected=true]:bg-foreground data-[selected=true]:text-background",
].join(" ");

function SectionHeader({
  title,
  seeAllLabel,
  onSeeAll,
}: {
  title: string;
  seeAllLabel: string;
  onSeeAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Typography className="text-foreground" type="h4" weight="semibold">
        {title}
      </Typography>
      <Link
        className="cursor-pointer text-sm font-medium text-stats-orange no-underline"
        onPress={onSeeAll}
      >
        {seeAllLabel}
      </Link>
    </div>
  );
}

export function AthleteWeightMetricsScreen({ metric }: AthleteWeightMetricsScreenProps) {
  const t = useTranslations("WeightMetrics");
  const tHistory = useTranslations("WeightHistory");
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodKey>("all");
  const history = useMemo(() => getRecentWeightHistory(3), []);
  const historyHref = `/athlete/metrics/${metric}/history`;
  const unit = t("unit");

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
    <AppLayout
      className="bg-background"
      header={
        <Header
          endContent={
            <Button
              aria-label={t("analytics")}
              isIconOnly
              onPress={() => undefined}
              size="lg"
              variant="ghost"
            >
              <ChartBar1 className="text-foreground" size={22} />
            </Button>
          }
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className="flex flex-col gap-6 pb-10 pt-2">
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-success text-success-foreground">
              <WeightScale size={26} />
            </span>
            <div className="flex items-baseline gap-1.5">
              <Typography
                className="text-[34px] leading-none tracking-tight text-foreground"
                weight="bold"
              >
                {t("currentWeight")}
              </Typography>
              <Typography className="text-lg text-muted" weight="medium">
                {unit}
              </Typography>
            </div>
          </div>
          <Typography className="text-muted" type="body-sm">
            {t("rangeCaption")}
          </Typography>
        </section>

        <ToggleButtonGroup
          aria-label={t("periodGroupLabel")}
          className="w-full gap-1.5 bg-transparent p-0 shadow-none"
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
              className={periodToggleClass}
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

        <section className="flex flex-col gap-3">
          <SectionHeader seeAllLabel={t("seeAll")} title={t("insightTitle")} />
          <MetricInsightCard
            changeLabel={t("bodyFatChange")}
            label={t("bodyFat")}
            series={INSIGHT_SERIES}
            tip={t("insightTip")}
            trendColor="var(--stats-red)"
            value={t("bodyFatValue")}
          />
        </section>

        <section className="flex flex-col gap-1">
          <SectionHeader
            onSeeAll={() => router.push(historyHref)}
            seeAllLabel={t("seeAll")}
            title={t("historyTitle")}
          />
          <div className="flex flex-col gap-2.5">
            {history.map((entry) => (
              <MetricHistoryItem
                alert={
                  entry.showAlert ? tHistory("alertHeavier") : undefined
                }
                aria-label={`${t("historyEntry")}: ${formatWeightKg(entry.kg, unit)}`}
                key={entry.id}
                onPress={() => router.push(historyHref)}
                subtitle={
                  entry.status === "goalCompleted"
                    ? tHistory("statusGoalCompleted")
                    : tHistory("statusStepsLeft", {
                        count: toPersianDigits(entry.stepsLeft ?? 0),
                      })
                }
                time={formatTimeFa(entry.hours, entry.minutes)}
                value={formatWeightKg(entry.kg, unit)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader seeAllLabel={t("seeAll")} title={t("goalTitle")} />
          <MetricGoalCard
            currentLabel={t("goalCurrent")}
            description={t("goalDescription")}
            editLabel={t("editGoal")}
            goalLabel={t("goalLabel")}
            goalValue={t("goalValue")}
            progress={30}
            progressLabel={t("goalProgress")}
          />
        </section>
      </div>
    </AppLayout>
  );
}
