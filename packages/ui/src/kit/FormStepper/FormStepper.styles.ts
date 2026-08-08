import { tv } from "tailwind-variants";

export const formStepperVariants = tv({
  slots: {
    root: "flex w-full items-start",
    step: "flex min-w-0 flex-1 flex-col items-center gap-1.5",
    indicatorRow: "flex w-full items-center",
    connector: "h-px flex-1 bg-border transition-colors",
    circle:
      "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
    label: "max-w-full truncate px-1 text-xs text-muted transition-colors",
  },
  variants: {
    state: {
      done: {
        circle: "border-accent bg-accent text-accent-foreground",
        label: "text-foreground",
        connector: "bg-accent",
      },
      active: {
        circle: "border-accent bg-transparent text-accent",
        label: "font-semibold text-accent",
      },
      pending: {
        circle: "border-border bg-default text-muted",
      },
    },
  },
  defaultVariants: {
    state: "pending",
  },
});
