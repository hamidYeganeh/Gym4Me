import { tv } from "tailwind-variants";

export const onboardingCaloriesSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-5",
    unitLabel: "text-sm font-medium text-muted",
    stepper: "flex w-full items-center justify-center gap-5",
    stepButton: "shrink-0 border border-border bg-default text-foreground",
    value: "min-w-[7rem] text-center text-4xl font-bold tabular-nums text-foreground",
    divider: "w-full max-w-xs bg-border",
    summary: "text-center text-sm text-muted",
    summaryValue: "inline-block font-semibold tabular-nums text-foreground",
    presets: "flex w-full flex-wrap items-center justify-center gap-2",
    preset:
      "border text-sm font-semibold outline-none transition-[border-color,background-color,color] duration-fast ease-app",
    presetIcon: "size-4",
  },
  variants: {
    selected: {
      true: {
        preset: "border-accent bg-accent/10 text-accent",
        presetIcon: "text-accent",
      },
      false: {
        preset: "border-accent/70 bg-transparent text-accent",
        presetIcon: "text-accent",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
