import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const metricHistoryItemVariants = tv({
  slots: {
    root: "relative w-full touch-pan-y overflow-hidden",
    actions:
      "absolute inset-y-0 end-0 z-0 flex items-center justify-center pe-1",
    deleteButton: [
      "size-14 shrink-0 rounded-full bg-danger text-danger-foreground",
      "shadow-none data-[pressed=true]:scale-95",
    ].join(" "),
    deleteIcon: "size-6",
    panel: [
      "relative z-10 flex w-full cursor-grab items-center gap-3",
      "rounded-[22px] border-0 bg-surface px-3.5 py-3.5",
      "text-start shadow-sm shadow-foreground/5 active:cursor-grabbing",
      "touch-pan-y select-none",
    ].join(" "),
    iconWrap:
      "flex size-11 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground",
    body: "flex min-w-0 flex-1 flex-col gap-1",
    value: "text-lg leading-none tracking-tight text-foreground",
    subtitle: "text-sm leading-snug text-muted",
    alert: "flex items-center gap-1.5 text-sm font-medium text-stats-orange",
    alertIcon: "size-3.5 shrink-0",
    meta: "flex shrink-0 items-center gap-1 self-start pt-0.5",
    time: "text-sm tabular-nums text-muted",
    chevron: "size-4 shrink-0 text-muted",
  },
});

export type MetricHistoryItemVariantProps = VariantProps<
  typeof metricHistoryItemVariants
>;
