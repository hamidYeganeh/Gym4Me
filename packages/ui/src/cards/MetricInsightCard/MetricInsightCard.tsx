"use client";

import { Typography } from "@heroui/react/typography";
import { ArrowDown } from "@repo/icons/ArrowDown";
import { metricInsightCardVariants } from "./MetricInsightCard.styles";
import type { MetricInsightCardProps } from "./MetricInsightCard.types";

const SPARK_W = 88;
const SPARK_H = 48;
const PAD = 2;

type Point = { x: number; y: number };

function toPoints(values: number[], min: number, max: number): Point[] {
  const range = max - min || 1;
  const usableW = SPARK_W - PAD * 2;
  const usableH = SPARK_H - PAD * 2;

  return values.map((value, index) => ({
    x: PAD + (index / Math.max(values.length - 1, 1)) * usableW,
    y: PAD + (1 - (value - min) / range) * usableH,
  }));
}

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

export function MetricInsightCard({
  label,
  value,
  changeLabel,
  tip,
  series,
  trendColor = "var(--stats-red)",
  className,
}: MetricInsightCardProps) {
  const slots = metricInsightCardVariants();
  const min = series.length > 0 ? Math.min(...series) : 0;
  const max = series.length > 0 ? Math.max(...series) : 1;
  const path = pointsToSmoothPath(toPoints(series, min, max));

  return (
    <div className={slots.root({ className })}>
      <div className={slots.row()}>
        <div className={slots.meta()}>
          <Typography className={slots.label()} type="body-sm" weight="medium">
            {label}
          </Typography>
          <Typography className={slots.value()} weight="bold">
            {value}
          </Typography>
          <Typography className={slots.change()} type="body-sm" weight="medium">
            <ArrowDown className={slots.changeIcon()} size={14} />
            {changeLabel}
          </Typography>
        </div>

        <svg
          aria-hidden
          className={slots.chart()}
          fill="none"
          preserveAspectRatio="none"
          viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        >
          {path ? (
            <path
              d={path}
              stroke={trendColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.25}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>
      </div>

      <Typography className={slots.tip()} type="body-sm">
        {tip}
      </Typography>
    </div>
  );
}
