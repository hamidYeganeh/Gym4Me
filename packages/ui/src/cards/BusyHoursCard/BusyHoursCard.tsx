"use client";

import { Typography } from "@heroui/react/typography";
import { Clock } from "@repo/icons/Clock";
import { busyHoursCardVariants } from "./BusyHoursCard.styles";
import type { BusyHoursCardProps } from "./BusyHoursCard.types";

const CHART_W = 320;
const CHART_H = 88;
const PAD_X = 4;
const PAD_Y = 8;

type Point = { x: number; y: number };

function toPoints(values: number[], min: number, max: number): Point[] {
  const range = max - min || 1;
  const usableW = CHART_W - PAD_X * 2;
  const usableH = CHART_H - PAD_Y * 2;

  return values.map((value, index) => ({
    x: PAD_X + (index / Math.max(values.length - 1, 1)) * usableW,
    y: PAD_Y + (1 - (value - min) / range) * usableH,
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

/** Soft ghost curve when no comparison series is provided. */
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

  const all = [...primary, ...secondary];
  const min = all.length > 0 ? Math.min(...all, 0) : 0;
  const max = all.length > 0 ? Math.max(...all, 100) : 100;

  const primaryPath = pointsToSmoothPath(toPoints(primary, min, max));
  const secondaryPath = pointsToSmoothPath(toPoints(secondary, min, max));
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
        <div className={slots.chart()}>
          <svg
            className={slots.chartSvg()}
            fill="none"
            preserveAspectRatio="none"
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          >
            {secondaryPath ? (
              <path
                d={secondaryPath}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.28}
                strokeWidth={2.5}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {primaryPath ? (
              <path
                d={primaryPath}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3.5}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
        </div>

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
