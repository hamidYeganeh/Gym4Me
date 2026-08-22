"use client";

import { PieChart } from "../../components/charts/pie-chart";
import { PieSlice } from "../../components/charts/pie-slice";
import { donutChartVariants } from "./DonutChart.styles";
import type { DonutChartProps } from "./DonutChart.types";

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
];

export function DonutChart({
  data,
  "aria-label": ariaLabel = "Chart",
  className,
  formatValue,
}: DonutChartProps) {
  const slots = donutChartVariants();
  const chartData = data.map((item, index) => ({
    label: item.label,
    value: item.value,
    color: item.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  }));

  return (
    <div className={slots.root({ className })}>
      <div aria-label={ariaLabel} className={slots.chart()} role="img">
        <PieChart
          className="h-full w-full"
          cornerRadius={6}
          data={chartData}
          innerRadius={72}
          padAngle={0.035}
        >
          {chartData.map((item, index) => (
            <PieSlice index={index} key={`${item.label}-${index}`} />
          ))}
        </PieChart>
      </div>
      <ul className={slots.legend()}>
        {chartData.map((item, index) => (
          <li className={slots.legendItem()} key={`${item.label}-${index}`}>
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
