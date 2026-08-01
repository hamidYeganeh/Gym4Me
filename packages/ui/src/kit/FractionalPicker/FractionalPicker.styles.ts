import { tv } from "tailwind-variants";

export const fractionalPickerVariants = tv({
  slots: {
    root: [
      "relative overflow-hidden rounded-4xl border border-border bg-surface",
      "text-surface-foreground transition-colors duration-moderate ease-app",
    ].join(" "),
    indicator:
      "pointer-events-none absolute top-0 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center",
    indicatorArrow:
      "h-6 w-10 rounded-b-xl bg-accent transition-colors duration-moderate ease-app",
    indicatorDot:
      "mt-1 h-1.5 w-1.5 rounded-full bg-accent transition-colors duration-moderate ease-app",
    track:
      "flex h-full w-max min-w-full cursor-[var(--pointer-cursor)] flex-row items-end",
    fadeLeft:
      "pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-surface via-surface/60 to-transparent transition-colors duration-moderate ease-app",
    fadeRight:
      "pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-surface via-surface/60 to-transparent transition-colors duration-moderate ease-app",
    item: "flex h-full shrink-0 flex-col",
    itemInner: "relative flex h-full w-full flex-col items-center justify-end",
    itemValue: "mb-1 select-none text-4xl font-semibold tabular-nums",
    ticks: "relative flex h-8 w-full items-end",
    tickMajor:
      "absolute left-1/2 z-10 h-8 w-1 -translate-x-1/2 rounded-t-full bg-muted transition-colors duration-moderate ease-app",
    tickRow: "flex w-full translate-x-1/2 justify-evenly",
    tickMinor:
      "h-4 w-1 rounded-t-full bg-border transition-colors duration-moderate ease-app",
  },
});
