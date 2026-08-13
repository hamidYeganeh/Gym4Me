"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { horizontalBarChartVariants } from "./HorizontalBarChart.styles";
import type { HorizontalBarChartProps } from "./HorizontalBarChart.types";

export function HorizontalBarChart({
  data,
  color = "var(--accent)",
  "aria-label": ariaLabel = "Chart",
  className,
  formatValue,
}: HorizontalBarChartProps) {
  const slots = horizontalBarChartVariants();
  const chartData = data.map((item) => ({
    ...item,
    name: item.label,
  }));
  const height = Math.max(192, data.length * 44);

  return (
    <div
      aria-label={ariaLabel}
      className={slots.root({ className })}
      role="img"
      style={{ height }}
    >
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <XAxis hide type="number" />
          <YAxis
            axisLine={false}
            dataKey="name"
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            tickLine={false}
            type="category"
            width={96}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--popover-foreground)",
            }}
            cursor={{ fill: "color-mix(in oklab, var(--accent) 8%, transparent)" }}
            formatter={(value) =>
              formatValue && typeof value === "number"
                ? formatValue(value)
                : value
            }
          />
          <Bar barSize={14} dataKey="value" radius={[0, 8, 8, 0]}>
            {chartData.map((item) => (
              <Cell fill={item.color ?? color} key={item.id} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
