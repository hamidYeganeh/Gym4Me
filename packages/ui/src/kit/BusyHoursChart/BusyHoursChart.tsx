"use client";

import { Typography } from "@heroui/react/typography";
import { Moon } from "@repo/icons/Moon";
import type { CSSProperties } from "react";
import { busyHoursChartVariants } from "./BusyHoursChart.styles";
import type { BusyHoursChartProps } from "./BusyHoursChart.types";

const DOT_COUNT = 3;

/** Map 0–100 busyness to how many dots light (1–3; 0 stays empty). */
function litDotCount(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value < 34) return 1;
  if (value < 67) return 2;
  return DOT_COUNT;
}

export function BusyHoursChart({
  data,
  color = "var(--accent)",
  "aria-label": ariaLabel = "Busy hours",
  todayLabel,
  className,
}: BusyHoursChartProps) {
  const slots = busyHoursChartVariants();

  return (
    <div
      aria-label={ariaLabel}
      className={slots.root({ className })}
      role="img"
      style={{ "--busy": color } as CSSProperties}
    >
      {todayLabel ? (
        <div className={slots.header()}>
          <Moon aria-hidden className={slots.headerIcon()} size={16} />
          <Typography className={slots.headerLabel()} type="body-sm">
            {todayLabel}
          </Typography>
        </div>
      ) : null}

      <div className={slots.chart()}>
        {data.map((point, columnIndex) => {
          const lit = litDotCount(point.value);
          return (
            <div className={slots.column()} key={`${point.label}-${columnIndex}`}>
              <div aria-hidden className={slots.dots()}>
                {Array.from({ length: DOT_COUNT }, (_, dotIndex) => {
                  const isLit = dotIndex < lit;
                  return (
                    <span
                      className={[slots.dot(), isLit ? slots.dotLit() : ""]
                        .filter(Boolean)
                        .join(" ")}
                      key={dotIndex}
                    />
                  );
                })}
              </div>
              <span className={slots.label()}>{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
