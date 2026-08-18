"use client";

import { Bar } from "../../components/charts/bar";
import { BarChart } from "../../components/charts/bar-chart";
import { BarYAxis } from "../../components/charts/bar-y-axis";
import { chartCssVars } from "../../components/charts/chart-context";
import { ChartTooltip } from "../../components/charts/tooltip";
import { CHART_MARGIN } from "../../lib/chart-series";
import { horizontalBarChartVariants } from "./HorizontalBarChart.styles";
import type { HorizontalBarChartProps } from "./HorizontalBarChart.types";

export function HorizontalBarChart({
  data,
  color = chartCssVars.linePrimary,
  "aria-label": ariaLabel = "Chart",
  className,
  formatValue,
}: HorizontalBarChartProps) {
  const slots = horizontalBarChartVariants();
  const height = Math.max(192, data.length * 44);

  return (
    <div
      aria-label={ariaLabel}
      className={slots.root({ className })}
      role="img"
      style={{ height }}
    >
      <BarChart
        aspectRatio="auto"
        className="h-full"
        data={data}
        margin={CHART_MARGIN.horizontalBar}
        orientation="horizontal"
        xDataKey="label"
      >
        <Bar dataKey="value" fill={color} lineCap={8} />
        <BarYAxis />
        <ChartTooltip
          content={({ point }) => (
            <div className={slots.tooltip()}>
              <div className="font-medium">{String(point.label ?? "")}</div>
              <div className="tabular-nums">
                {formatValue && typeof point.value === "number"
                  ? formatValue(point.value)
                  : (point.value as number)}
              </div>
            </div>
          )}
          showDatePill={false}
        />
      </BarChart>
    </div>
  );
}
