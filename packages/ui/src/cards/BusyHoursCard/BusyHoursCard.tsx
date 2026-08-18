"use client";

import { Typography } from "@heroui/react/typography";
import { Clock } from "@repo/icons/Clock";
import { Line } from "../../components/charts/line";
import { LineChart } from "../../components/charts/line-chart";
import { CHART_MARGIN, toTimeSeries } from "../../lib/chart-series";
import { busyHoursCardVariants } from "./BusyHoursCard.styles";
import type { BusyHoursCardProps } from "./BusyHoursCard.types";

function ghostValues(values: number[]): number[] {
  if (values.length === 0) return [];
  return values.map((value, index) => {
    const prev = values[index - 1] ?? value;
    const next = values[index + 1] ?? value;
    return ((prev + value + next) / 3) * 0.82;
  });
}

function peakValue(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(Math.max(...values));
}

export function BusyHoursCard({
  title,
  data,
  compareData,
  value,
  unit = "%",
  "aria-label": ariaLabel = "Busy hours",
  className,
}: BusyHoursCardProps) {
  const slots = busyHoursCardVariants();
  const primary = data.map((point) => point.value);
  const secondary =
    compareData && compareData.length > 0
      ? compareData.map((point) => point.value)
      : ghostValues(primary);

  const series = toTimeSeries(data).map((point, index) => ({
    ...point,
    compare: secondary[index] ?? 0,
  }));
  const displayValue = value ?? peakValue(primary);

  return (
    <div
      aria-label={ariaLabel}
      className={slots.root({ className })}
      role="img"
    >
      <div className={slots.header()}>
        <Typography className={slots.title()} type="body" weight="medium">
          {title}
        </Typography>
        <Clock aria-hidden className={slots.icon()} size={20} />
      </div>

      <div aria-hidden className={slots.chartBlock()}>
        <LineChart
          aspectRatio="auto"
          className={slots.chart()}
          data={series}
          margin={CHART_MARGIN.sparkline}
          style={{ height: "100%" }}
          xDataKey="date"
        >
          <Line
            dataKey="compare"
            showHighlight={false}
            stroke="color-mix(in oklab, var(--accent-foreground) 28%, transparent)"
            strokeWidth={2.5}
          />
          <Line
            dataKey="value"
            showHighlight={false}
            stroke="currentColor"
            strokeWidth={3.5}
          />
        </LineChart>

        {data.length > 0 ? (
          <div className={slots.labels()}>
            {data.map((point, index) => (
              <span className={slots.label()} key={`${point.label}-${index}`}>
                {point.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={slots.footer()}>
        <Typography className={slots.value()} weight="bold">
          {displayValue}
        </Typography>
        {unit ? (
          <Typography className={slots.unit()} type="body" weight="medium">
            {unit}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}
