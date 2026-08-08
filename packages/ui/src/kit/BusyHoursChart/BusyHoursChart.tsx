"use client";

import { Typography } from "@heroui/react";
import type { CSSProperties } from "react";
import { busyHoursChartVariants } from "./BusyHoursChart.styles";
import type { BusyHoursChartProps } from "./BusyHoursChart.types";

export function BusyHoursChart({
  data,
  color = "var(--accent)",
  "aria-label": ariaLabel = "Busy hours",
  peakLabel,
  className,
}: BusyHoursChartProps) {
  const slots = busyHoursChartVariants();
  const max = Math.max(...data.map((point) => point.value), 1);
  const peakIndex = data.reduce(
    (best, point, index) =>
      point.value > (data[best]?.value ?? -1) ? index : best,
    0,
  );
  const peak = data[peakIndex];

  return (
    <div
      aria-label={ariaLabel}
      className={slots.root({ className })}
      dir="ltr"
      role="img"
      style={{ "--busy": color } as CSSProperties}
    >
      <div className={slots.chart()}>
        {data.map((point, index) => {
          const height = Math.max(8, Math.round((point.value / max) * 100));
          const isPeak = index === peakIndex;
          return (
            <div className={slots.column()} key={`${point.label}-${index}`}>
              <div className={slots.track()}>
                <div
                  className={[slots.bar(), isPeak ? slots.barPeak() : ""]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span
                className={[slots.label(), isPeak ? slots.labelPeak() : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                {point.label}
              </span>
            </div>
          );
        })}
      </div>

      {peak && peakLabel ? (
        <div className={slots.peakMeta()}>
          <Typography className={slots.peakMetaLabel()} type="body-xs">
            {peakLabel}
          </Typography>
          <Typography className={slots.peakMetaValue()} type="body-sm">
            {peak.label}
          </Typography>
        </div>
      ) : null}
    </div>
  );
}
