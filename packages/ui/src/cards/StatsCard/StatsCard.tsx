"use client";

import { Typography } from "@heroui/react";
import { Plus } from "@repo/icons/Plus";
import { WaterDrop } from "@repo/icons/WaterDrop";
import type { CSSProperties, HTMLAttributes } from "react";
import { statsCardVariants } from "./StatsCard.styles";
import type { StatsCardProps } from "./StatsCard.types";

const DEFAULT_FOREGROUND = "var(--stats-foreground)";
const LINE_COLOR = "var(--stats-blue)";
const BAR_COLOR = "var(--stats-orange)";
/** Soft highlight that tracks surface + accent in both themes. */
const BAR_HIGHLIGHT_FILL =
  "color-mix(in oklch, var(--accent) 28%, var(--surface))";
const CHART_WIDTH = 118;
const CHART_HEIGHT = 72;
const CHART_PAD = 2;

/** Opacity by distance from the highlighted bar (matches Score mock). */
const BAR_OPACITY_BY_DISTANCE = [1, 0.75, 0.45, 0.28] as const;

type Point = { x: number; y: number };

function toPoints(
  values: number[],
  min: number,
  max: number,
  width: number,
  height: number,
  pad: number,
): Point[] {
  const range = max - min || 1;
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;

  return values.map((value, index) => ({
    x: pad + (index / Math.max(values.length - 1, 1)) * usableW,
    y: pad + (1 - (value - min) / range) * usableH,
  }));
}

/** Catmull-Rom → cubic Bézier smooth path (no markers). */
function pointsToSmoothPath(points: Point[]): string {
  const first = points[0];
  if (!first) return "";
  if (points.length === 1) return `M ${first.x} ${first.y}`;

  let d = `M ${first.x} ${first.y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!p1 || !p2) continue;

    const p0 = points[i - 1] ?? p1;
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

function seriesPath(values: number[], min: number, max: number): string {
  return pointsToSmoothPath(
    toPoints(values, min, max, CHART_WIDTH, CHART_HEIGHT, CHART_PAD),
  );
}

function barOpacity(index: number, highlightIndex: number): number {
  const distance = Math.abs(index - highlightIndex);
  return (
    BAR_OPACITY_BY_DISTANCE[
      Math.min(distance, BAR_OPACITY_BY_DISTANCE.length - 1)
    ] ?? 0.28
  );
}

function LineChart({
  series,
  comparisonSeries,
  className,
}: {
  series: number[];
  comparisonSeries?: number[];
  className?: string;
}) {
  const slots = statsCardVariants();
  const allValues =
    comparisonSeries && comparisonSeries.length > 0
      ? [...series, ...comparisonSeries]
      : series;
  const min = allValues.length > 0 ? Math.min(...allValues) : 0;
  const max = allValues.length > 0 ? Math.max(...allValues) : 1;

  const primaryPath = series.length > 0 ? seriesPath(series, min, max) : "";
  const comparisonPath =
    comparisonSeries && comparisonSeries.length > 0
      ? seriesPath(comparisonSeries, min, max)
      : null;

  return (
    <svg
      aria-hidden
      className={slots.chart({ className })}
      fill="none"
      preserveAspectRatio="none"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
    >
      {comparisonPath ? (
        <path
          d={comparisonPath}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={0.38}
          strokeWidth={3.25}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {primaryPath ? (
        <path
          d={primaryPath}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3.75}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}

function BarChart({
  series,
  highlightIndex,
  foregroundColor,
  className,
}: {
  series: number[];
  highlightIndex: number;
  foregroundColor: string;
  className?: string;
}) {
  const slots = statsCardVariants();
  const max = series.length > 0 ? Math.max(...series, 1) : 1;

  return (
    <div aria-hidden className={slots.chart({ className })}>
      <div className={slots.bars()}>
        {series.map((value, index) => {
          const isHighlight = index === highlightIndex;
          return (
            <span
              className={slots.bar()}
              key={`${index}-${value}`}
              style={{
                height: `${Math.max((value / max) * 100, 14)}%`,
                backgroundColor: isHighlight
                  ? BAR_HIGHLIGHT_FILL
                  : foregroundColor,
                opacity: barOpacity(index, highlightIndex),
              }}
            />
          );
        })}
      </div>
    </div>
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
  const highlightIndex =
    props.chart === "bar" && props.highlightIndex != null
      ? props.highlightIndex
      : Math.floor(Math.max(series.length - 1, 0) / 2);

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
        <BarChart
          className={chartClassName}
          foregroundColor={foregroundColor}
          highlightIndex={highlightIndex}
          series={series}
        />
      ) : (
        <LineChart
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
