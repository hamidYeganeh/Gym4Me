"use client";

import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { WaterDrop } from "@repo/icons/WaterDrop";
import type { CSSProperties, HTMLAttributes } from "react";
import { Bar } from "../../components/charts/bar";
import { BarChart } from "../../components/charts/bar-chart";
import { Line } from "../../components/charts/line";
import { LineChart } from "../../components/charts/line-chart";
import { CHART_MARGIN, toIndexedTimeSeries } from "../../lib/chart-series";
import { statsCardVariants } from "./StatsCard.styles";
import type { StatsCardProps } from "./StatsCard.types";

const DEFAULT_FOREGROUND = "var(--stats-foreground)";
const LINE_COLOR = "var(--stats-blue)";
const BAR_COLOR = "var(--stats-orange)";

function SparkLineChart({
  series,
  comparisonSeries,
  className,
}: {
  series: number[];
  comparisonSeries?: number[];
  className?: string;
}) {
  const slots = statsCardVariants();
  const data = toIndexedTimeSeries(series).map((point, index) => ({
    ...point,
    compare: comparisonSeries?.[index] ?? null,
  }));

  return (
    <LineChart
      animationDuration={900}
      aspectRatio="auto"
      className={slots.chart({ className })}
      data={data}
      margin={CHART_MARGIN.sparkline}
      style={{ height: "100%" }}
      xDataKey="date"
    >
      {comparisonSeries && comparisonSeries.length > 0 ? (
        <Line
          dataKey="compare"
          showHighlight={false}
          stroke="color-mix(in oklab, var(--stats-foreground) 38%, transparent)"
          strokeWidth={3.25}
        />
      ) : null}
      <Line
        dataKey="value"
        showHighlight={false}
        stroke="currentColor"
        strokeWidth={3.75}
      />
    </LineChart>
  );
}

function SparkBarChart({
  series,
  className,
}: {
  series: number[];
  className?: string;
}) {
  const slots = statsCardVariants();
  const data = series.map((value, index) => ({
    name: String(index),
    value,
  }));

  return (
    <BarChart
      animationDuration={900}
      aspectRatio="auto"
      className={slots.chart({ className })}
      data={data}
      margin={{ top: 4, right: 2, bottom: 0, left: 2 }}
      xDataKey="name"
    >
      <Bar
        dataKey="value"
        fill="currentColor"
        lineCap="round"
        minBarHeight={8}
      />
    </BarChart>
  );
}

function pickDomProps(
  props: StatsCardProps,
): HTMLAttributes<HTMLDivElement> {
  const {
    title: _title,
    value: _value,
    unit: _unit,
    icon: _icon,
    series: _series,
    color: _color,
    foregroundColor: _foregroundColor,
    chartClassName: _chartClassName,
    chart: _chart,
    comparisonSeries: _comparisonSeries,
    highlightIndex: _highlightIndex,
    className: _className,
    style: _style,
    ...domProps
  } = props as StatsCardProps & {
    comparisonSeries?: number[];
    highlightIndex?: number;
  };

  return domProps;
}

export function StatsCard(props: StatsCardProps) {
  const chart = props.chart ?? "line";
  const {
    title,
    value,
    unit,
    icon,
    series,
    color,
    foregroundColor = DEFAULT_FOREGROUND,
    chartClassName,
    className,
    style,
  } = props;

  const comparisonSeries =
    props.chart === "bar" ? undefined : props.comparisonSeries;

  const slots = statsCardVariants();
  const resolvedColor = color ?? (chart === "bar" ? BAR_COLOR : LINE_COLOR);
  const resolvedIcon =
    icon ??
    (chart === "bar" ? <Plus size={18} /> : <WaterDrop size={18} />);

  const rootStyle: CSSProperties = {
    backgroundColor: resolvedColor,
    color: foregroundColor,
    ...style,
  };

  return (
    <div
      className={slots.root({ className })}
      style={rootStyle}
      {...pickDomProps(props)}
    >
      <div className={slots.header()}>
        <Typography className={slots.title()} type="body-sm" weight="medium">
          {title}
        </Typography>
        <span aria-hidden className={slots.icon()}>
          {resolvedIcon}
        </span>
      </div>

      {chart === "bar" ? (
        <SparkBarChart className={chartClassName} series={series} />
      ) : (
        <SparkLineChart
          className={chartClassName}
          comparisonSeries={comparisonSeries}
          series={series}
        />
      )}

      <div className={slots.footer()}>
        <Typography className={slots.value()} weight="bold">
          {value}
        </Typography>
        {unit != null && unit !== "" ? (
          <Typography className={slots.unit()} weight="medium">
            {unit}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}
