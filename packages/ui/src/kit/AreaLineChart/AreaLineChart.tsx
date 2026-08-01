"use client";

import { useId } from "react";
import { areaLineChartVariants } from "./AreaLineChart.styles";
import type { AreaLineChartProps } from "./AreaLineChart.types";

const WIDTH = 320;
const HEIGHT = 160;
const PAD_X = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 8;
const GRID_ROWS = 4;

type Point = { x: number; y: number };

function toPoints(
  values: number[],
  min: number,
  max: number,
): Point[] {
  const range = max - min || 1;
  const usableW = WIDTH - PAD_X * 2;
  const usableH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  return values.map((value, index) => ({
    x: PAD_X + (index / Math.max(values.length - 1, 1)) * usableW,
    y: PAD_TOP + (1 - (value - min) / range) * usableH,
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

function pointsToAreaPath(points: Point[]): string {
  const line = pointsToSmoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  if (!line || !first || !last) return "";

  const baseline = HEIGHT - PAD_BOTTOM;
  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

export function AreaLineChart({
  data,
  color = "var(--success)",
  "aria-label": ariaLabel = "Chart",
  className,
}: AreaLineChartProps) {
  const slots = areaLineChartVariants();
  const gradientId = useId();
  const values = data.map((point) => point.value);
  const min = values.length > 0 ? Math.min(...values) * 0.98 : 0;
  const max = values.length > 0 ? Math.max(...values) * 1.02 : 1;
  const points = toPoints(values, min, max);
  const linePath = pointsToSmoothPath(points);
  const areaPath = pointsToAreaPath(points);

  return (
    <div className={slots.root({ className })} dir="ltr">
      <div className={slots.chart()}>
        <svg
          aria-label={ariaLabel}
          className={slots.svg()}
          fill="none"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {Array.from({ length: GRID_ROWS + 1 }, (_, index) => {
            const y =
              PAD_TOP +
              (index / GRID_ROWS) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
            return (
              <line
                key={`h-${index}`}
                stroke="var(--border)"
                strokeDasharray="4 6"
                strokeWidth={1}
                x1={PAD_X}
                x2={WIDTH - PAD_X}
                y1={y}
                y2={y}
              />
            );
          })}

          {points.map((_, index) => {
            const x =
              PAD_X +
              (index / Math.max(points.length - 1, 1)) *
                (WIDTH - PAD_X * 2);
            return (
              <line
                key={`v-${index}`}
                stroke="var(--border)"
                strokeDasharray="4 6"
                strokeOpacity={0.55}
                strokeWidth={1}
                x1={x}
                x2={x}
                y1={PAD_TOP}
                y2={HEIGHT - PAD_BOTTOM}
              />
            );
          })}

          {areaPath ? (
            <path d={areaPath} fill={`url(#${gradientId})`} />
          ) : null}

          {linePath ? (
            <path
              d={linePath}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {points.map((point, index) => (
            <circle
              cx={point.x}
              cy={point.y}
              fill={color}
              key={`dot-${index}`}
              r={3.5}
              stroke="var(--surface)"
              strokeWidth={1.5}
            />
          ))}
        </svg>
      </div>

      <div className={slots.labels()}>
        {data.map((point) => (
          <span className={slots.label()} key={point.label}>
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
