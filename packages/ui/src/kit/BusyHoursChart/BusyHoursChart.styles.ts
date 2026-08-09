import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const busyHoursChartVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-4",
    header: "flex items-center gap-2 text-muted",
    headerIcon: "size-4 shrink-0 text-muted",
    headerLabel: "text-sm font-medium text-muted",
    chart: "flex w-full items-end justify-between gap-1 px-0.5",
    column: "flex min-w-0 flex-1 flex-col items-center gap-2.5",
    dots: "flex flex-col-reverse items-center gap-2",
    dot: [
      "size-2.5 shrink-0 rounded-full transition-colors duration-200",
      "bg-foreground/15",
    ].join(" "),
    dotLit: "bg-[var(--busy)] shadow-[0_0_10px_color-mix(in_oklch,var(--busy)_45%,transparent)]",
    label: "text-[0.7rem] font-medium uppercase tracking-wide text-muted",
  },
});

export type BusyHoursChartVariantProps = VariantProps<
  typeof busyHoursChartVariants
>;
