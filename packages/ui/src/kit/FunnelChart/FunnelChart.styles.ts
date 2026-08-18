import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const funnelChartVariants = tv({
  slots: {
    root: "h-full min-h-56 w-full",
  },
});

export type FunnelChartVariantProps = VariantProps<typeof funnelChartVariants>;
