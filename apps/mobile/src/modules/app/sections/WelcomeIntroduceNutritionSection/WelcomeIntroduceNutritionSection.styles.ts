import { tv } from "tailwind-variants";

export const welcomeIntroduceNutritionSectionVariants = tv({
  slots: {
    root: "relative mx-auto flex w-full max-w-[21.5rem] shrink-0 flex-col items-center gap-3",
    heroCard: [
      "relative z-10 flex w-full overflow-hidden rounded-[1.5rem] bg-surface",
      "ring-1 ring-border/60",
    ],
    heroCopy: "flex min-w-0 flex-1 flex-col gap-3 p-4",
    badgeRow: "inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-accent",
    title: "text-[0.9375rem] leading-snug font-bold text-foreground",
    macros: "flex gap-4",
    macro: "flex min-w-[2.875rem] flex-col",
    macroValue: "text-[0.875rem] font-semibold text-foreground",
    macroLabel: "text-[0.6875rem] text-muted",
    heroMedia: [
      "relative w-[8.3rem] shrink-0",
      "bg-[radial-gradient(circle_at_30%_30%,#fdba74,transparent_55%),linear-gradient(160deg,#fb923c,#ea580c_55%,#9a3412)]",
    ],
    connector: "relative z-0 -my-1 h-8 w-[70%] max-w-[15rem]",
    path: "h-full w-full stroke-border stroke-2 fill-none",
    cta: [
      "relative z-10 rounded-full bg-accent px-4 py-1.5 text-[0.75rem] font-semibold",
      "text-accent-foreground",
    ],
    tipCard: [
      "relative z-10 flex w-full items-start gap-3 rounded-[1.25rem] bg-surface p-4",
      "ring-1 ring-border/60",
      "",
    ],
    tipIcon:
      "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent",
    tipCopy: "min-w-0 flex-1",
    tipTitle: "text-[0.8125rem] font-semibold text-foreground",
    tipBody: "mt-1 text-[0.75rem] leading-relaxed text-muted",
  },
});
