"use client";

import { Button, Card, Typography } from "@heroui/react";
import { ChevronRight } from "@repo/icons/ChevronRight";
import type { CSSProperties } from "react";
import {
  BarsChart,
  DotsChart,
  LineChart,
  MoodsChart,
  RangeChart,
  RingsChart,
  StackedChart,
} from "./MetricCard.charts";
import { metricCardVariants } from "./MetricCard.styles";
import type { MetricCardChart, MetricCardProps } from "./MetricCard.types";

const DEFAULT_DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function defaultAccent(chart: MetricCardChart): string {
  switch (chart.type) {
    case "line":
      return "var(--stats-red)";
    case "bars":
      return "var(--stats-orange)";
    case "stacked":
      return "var(--stats-blue)";
    case "range":
      return "var(--stats-purple)";
    case "rings":
      return "var(--stats-orange)";
    case "dots":
      return "var(--success)";
    case "moods":
      return "var(--muted)";
    default: {
      const _exhaustive: never = chart;
      return _exhaustive;
    }
  }
}

function chartColor(chart: MetricCardChart): string | undefined {
  return "color" in chart ? chart.color : undefined;
}

function ChartView({
  chart,
  accent,
  slots,
}: {
  chart: MetricCardChart;
  accent: string;
  slots: ReturnType<typeof metricCardVariants>;
}) {
  switch (chart.type) {
    case "line":
      return <LineChart accent={accent} chart={chart} slots={slots} />;
    case "bars":
      return <BarsChart accent={accent} chart={chart} slots={slots} />;
    case "stacked":
      return <StackedChart accent={accent} chart={chart} slots={slots} />;
    case "range":
      return <RangeChart accent={accent} chart={chart} slots={slots} />;
    case "rings":
      return <RingsChart accent={accent} chart={chart} slots={slots} />;
    case "dots":
      return <DotsChart accent={accent} chart={chart} slots={slots} />;
    case "moods":
      return <MoodsChart chart={chart} slots={slots} />;
    default: {
      const _exhaustive: never = chart;
      return _exhaustive;
    }
  }
}

export function MetricCard({
  title,
  icon,
  value,
  unit,
  status,
  periodLabel = "Today",
  dayLabels = DEFAULT_DAY_LABELS,
  chart,
  variant = "horizontal",
  color,
  onPress,
  className,
}: MetricCardProps) {
  const slots = metricCardVariants({ variant });
  const accent = color ?? chartColor(chart) ?? defaultAccent(chart);
  const rootStyle = {
    ["--metric-accent" as string]: accent,
  } satisfies CSSProperties;

  return (
    <Card
      className={slots.root({ className })}
      data-pressable={onPress ? true : undefined}
      style={rootStyle}
      variant="transparent"
    >
      <Card.Header className={slots.header()}>
        <div className={slots.titleGroup()}>
          <span aria-hidden className={slots.icon()}>
            {icon}
          </span>
          {/* Vertical hides the title visually (sr-only); keep for a11y. */}
          <Card.Title className={slots.title()}>{title}</Card.Title>
        </div>

        {onPress ? (
          <Button className={slots.period()} onPress={onPress} variant="ghost">
            <span>{periodLabel}</span>
            <ChevronRight
              aria-hidden
              className={slots.periodIcon()}
              size={12}
            />
          </Button>
        ) : (
          <span className={slots.period()}>
            <span>{periodLabel}</span>
            <ChevronRight
              aria-hidden
              className={slots.periodIcon()}
              size={12}
            />
          </span>
        )}
      </Card.Header>

      <Card.Content className={slots.body()}>
        <div className={slots.meta()}>
          {/*
            Horizontal: value + unit on one LTR row.
            Vertical: unit stacks under value (dir only on the value itself).
          */}
          <div className={slots.valueRow()}>
            <Typography className={slots.value()} dir="ltr">
              {value}
            </Typography>
            {unit != null && unit !== "" ? (
              <Typography className={slots.unit()}>{unit}</Typography>
            ) : null}
          </div>
          {status != null && status !== "" ? (
            <Card.Description className={slots.status()}>
              {status}
            </Card.Description>
          ) : null}
        </div>

        {/* Charts + weekday labels stay LTR (Mon → Sun) */}
        <div className={slots.chart()} dir="ltr">
          <div className={slots.plot()}>
            <ChartView accent={accent} chart={chart} slots={slots} />
          </div>
          <div className={slots.days()}>
            {dayLabels.map((label, index) => (
              <Typography
                className={slots.day()}
                key={`${label}-${index}`}
                type="body-sm"
              >
                {label}
              </Typography>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
