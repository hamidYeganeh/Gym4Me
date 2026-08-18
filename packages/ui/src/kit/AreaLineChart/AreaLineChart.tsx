"use client";

import { Area } from "../../components/charts/area";
import { AreaChart } from "../../components/charts/area-chart";
import { chartCssVars } from "../../components/charts/chart-context";
import { Grid } from "../../components/charts/grid";
import { ChartTooltip } from "../../components/charts/tooltip";
import { XAxis } from "../../components/charts/x-axis";
import { CHART_MARGIN, toTimeSeries } from "../../lib/chart-series";
import { areaLineChartVariants } from "./AreaLineChart.styles";
import type { AreaLineChartProps } from "./AreaLineChart.types";

export function AreaLineChart({
  data,
  color = chartCssVars.linePrimary,
  "aria-label": ariaLabel = "Chart",
  className,
}: AreaLineChartProps) {
  const slots = areaLineChartVariants();
  const series = toTimeSeries(data);

  return (
    <div
      aria-label={ariaLabel}
      className={slots.root({ className })}
      dir="ltr"
      role="img"
    >
      <AreaChart
        aspectRatio="auto"
        className={slots.chart()}
        data={series}
        margin={CHART_MARGIN.compact}
        style={{ height: "100%" }}
        xDataKey="date"
      >
        <Grid horizontal />
        <Area
          dataKey="value"
          fill={color}
          fillOpacity={0.28}
          stroke={color}
          strokeWidth={2.5}
        />
        <XAxis />
        <ChartTooltip
          content={({ point }) => (
            <div className={slots.tooltip()}>
              <div className="font-medium">{String(point.label ?? "")}</div>
              <div className="tabular-nums">{point.value as number}</div>
            </div>
          )}
          showDatePill={false}
        />
      </AreaChart>
    </div>
  );
}
