import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const horizontalBarChartVariants = tv({
  slots: {
    root: "h-full min-h-48 w-full",
    tooltip:
      "rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg",
  },
});

export type HorizontalBarChartVariantProps = VariantProps<
  typeof horizontalBarChartVariants
>;
