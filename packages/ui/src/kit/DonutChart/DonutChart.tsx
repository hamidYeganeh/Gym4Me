"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { donutChartVariants } from "./DonutChart.styles";
import type { DonutChartProps } from "./DonutChart.types";

const FALLBACK_COLORS = [
  "var(--accent)",
  "var(--stats-blue)",
  "var(--stats-purple)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "var(--stats-orange)",
  "var(--muted)",
];

export function DonutChart({
  data,
  "aria-label": ariaLabel = "Chart",
  className,
  formatValue,
}: DonutChartProps) {
  const slots = donutChartVariants();
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  }));

  return (
    <div className={slots.root({ className })}>
      <div aria-label={ariaLabel} className={slots.chart()} role="img">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={chartData}
              dataKey="value"
              innerRadius="58%"
              nameKey="label"
              outerRadius="82%"
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {chartData.map((item) => (
                <Cell fill={item.color} key={item.id} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--popover-foreground)",
              }}
              formatter={(value) =>
                formatValue && typeof value === "number"
                  ? formatValue(value)
                  : value
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className={slots.legend()}>
        {chartData.map((item) => (
          <li className={slots.legendItem()} key={item.id}>
            <span className={slots.legendLabel()}>
              <span
                aria-hidden
                className={slots.swatch()}
                style={{ background: item.color }}
              />
              {item.label}
            </span>
            <span className={slots.legendValue()}>
              {formatValue ? formatValue(item.value) : item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
