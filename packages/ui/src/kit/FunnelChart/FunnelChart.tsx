"use client";

import { chartCssVars } from "../../components/charts/chart-context";
import { FunnelChart as BklitFunnelChart } from "../../components/charts/funnel-chart";
import { funnelChartVariants } from "./FunnelChart.styles";
import type { FunnelChartProps } from "./FunnelChart.types";

export function FunnelChart({
  data,
  color = chartCssVars.linePrimary,
  "aria-label": ariaLabel = "Chart",
  className,
  formatValue,
  formatPercentage,
}: FunnelChartProps) {
  const slots = funnelChartVariants();

  return (
    <div aria-label={ariaLabel} className={slots.root({ className })} role="img">
      <BklitFunnelChart
        className="h-full min-h-56 w-full"
        color={color}
        data={data}
        formatPercentage={formatPercentage}
        formatValue={formatValue}
        orientation="vertical"
      />
    </div>
  );
}
