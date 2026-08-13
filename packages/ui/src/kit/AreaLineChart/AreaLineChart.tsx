"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { areaLineChartVariants } from "./AreaLineChart.styles";
import type { AreaLineChartProps } from "./AreaLineChart.types";

export function AreaLineChart({
  data,
  color = "var(--success)",
  "aria-label": ariaLabel = "Chart",
  className,
}: AreaLineChartProps) {
  const slots = areaLineChartVariants();
  const gradientId = useId().replace(/:/g, "");

  return (
    <div
      aria-label={ariaLabel}
      className={slots.root({ className })}
      dir="ltr"
      role="img"
    >
      <div className={slots.chart()}>
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="4 6"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--popover-foreground)",
              }}
            />
            <Area
              dataKey="value"
              fill={`url(#${gradientId})`}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
