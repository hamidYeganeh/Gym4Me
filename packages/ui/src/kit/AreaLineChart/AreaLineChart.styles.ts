import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const areaLineChartVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    chart: "relative h-[180px] w-full",
    svg: "size-full overflow-visible",
    labels: "flex w-full justify-between px-0.5",
    label: "text-[11px] tabular-nums text-muted [unicode-bidi:plaintext]",
  },
});

export type AreaLineChartVariantProps = VariantProps<
  typeof areaLineChartVariants
>;
