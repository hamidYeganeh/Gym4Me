import { tv } from "tailwind-variants";

export const pointsLedgerScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[1500px] flex-col gap-5",
    intro: "flex flex-col gap-2",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    actions: "flex flex-wrap gap-2",
    statsGrid: "grid grid-cols-2 gap-3 lg:grid-cols-4",
    statValue: "text-2xl font-bold tabular-nums",
    statLabel: "text-xs text-muted",
    breakdownGrid: "grid grid-cols-1 gap-3 lg:grid-cols-2",
    breakdownList: "flex flex-col gap-2",
    breakdownRow:
      "flex items-center justify-between gap-2 rounded-xl bg-content2 px-3 py-2 text-sm",
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-2",
    chips: "flex flex-wrap gap-1.5",
  },
});
