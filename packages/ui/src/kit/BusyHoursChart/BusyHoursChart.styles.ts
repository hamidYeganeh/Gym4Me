import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const busyHoursChartVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-3",
    chart: "relative flex h-[11.5rem] w-full items-end gap-2 px-1 pt-2",
    column: "flex min-w-0 flex-1 flex-col items-center justify-end gap-2",
    track: [
      "relative flex w-full max-w-[2.25rem] flex-1 items-end overflow-hidden",
      "rounded-full bg-surface-secondary/80",
    ].join(" "),
    bar: [
      "w-full rounded-full transition-[height] duration-300 ease-out",
      "bg-linear-to-t from-[color-mix(in_oklch,var(--busy)_35%,transparent)] to-[var(--busy)]",
    ].join(" "),
    barPeak: [
      "shadow-[0_0_16px_color-mix(in_oklch,var(--busy)_45%,transparent)]",
      "ring-2 ring-[color-mix(in_oklch,var(--busy)_40%,transparent)]",
    ].join(" "),
    label: "text-[11px] tabular-nums text-muted [unicode-bidi:plaintext]",
    labelPeak: "font-semibold text-foreground",
    peakMeta:
      "flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface-secondary/50 px-3.5 py-2.5",
    peakMetaLabel: "text-xs text-muted",
    peakMetaValue: "text-sm font-semibold tabular-nums text-foreground",
  },
});

export type BusyHoursChartVariantProps = VariantProps<
  typeof busyHoursChartVariants
>;
