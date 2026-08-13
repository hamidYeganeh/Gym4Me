import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const areaLineChartVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    chart: "relative h-[180px] w-full",
  },
});

export type AreaLineChartVariantProps = VariantProps<
  typeof areaLineChartVariants
>;
