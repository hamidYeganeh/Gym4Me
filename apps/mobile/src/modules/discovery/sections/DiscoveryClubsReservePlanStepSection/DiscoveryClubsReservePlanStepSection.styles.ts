import { tv } from "tailwind-variants";

export const discoveryClubsReservePlanStepSectionVariants = tv({
  slots: {
    section: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    plans: "flex flex-col gap-3",
    planCard: [
      "h-auto w-full flex-col items-start gap-2 rounded-2xl border border-border/60",
      "bg-surface p-4 text-start font-normal transition-[border-color,background-color,box-shadow]",
      "[--button-bg:var(--surface)]",
      "[--button-bg-hover:color-mix(in_oklab,var(--accent)_8%,var(--surface))]",
      "[--button-bg-pressed:color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
    ].join(" "),
    planCardSelected: [
      "border-accent",
      "bg-[color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
      "ring-2 ring-accent/20",
      "[--button-bg:color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
      "[--button-bg-hover:color-mix(in_oklab,var(--accent)_16%,var(--surface))]",
      "[--button-bg-pressed:color-mix(in_oklab,var(--accent)_18%,var(--surface))]",
    ].join(" "),
    planHeader: "flex w-full items-start justify-between gap-3",
    planTitleBlock: "flex min-w-0 flex-col gap-1",
    planTitle: "text-foreground",
    planPriceRow: "flex flex-wrap items-baseline gap-1 text-accent",
    planPrice: "text-lg font-semibold tabular-nums leading-none",
    planPriceSuffix: "text-xs font-normal text-muted",
    planDescription: "text-start text-muted",
    planCheck: "mt-0.5 shrink-0 text-accent",
  },
});
