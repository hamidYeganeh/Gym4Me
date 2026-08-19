import { tv } from "tailwind-variants";

export const formStepperVariants = tv({
  slots: {
    root: [
      "flex w-full items-start overflow-x-auto overscroll-x-contain",
      "scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ].join(" "),
    step: [
      "flex min-w-[4.75rem] shrink-0 grow basis-0 snap-center",
      "flex-col items-center gap-1.5 sm:min-w-[5.25rem]",
    ].join(" "),
    indicatorRow: "flex w-full items-center",
    connector: "h-px min-w-2 flex-1 bg-border transition-colors",
    circle:
      "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
    label: [
      "w-full px-0.5 text-center text-[11px] leading-snug text-foreground/70 transition-colors",
      "line-clamp-2 break-words",
    ].join(" "),
  },
  variants: {
    state: {
      done: {
        circle: "border-accent bg-accent text-accent-foreground",
        label: "font-medium text-foreground",
        connector: "bg-accent",
      },
      active: {
        circle: "border-accent bg-accent/15 text-accent shadow-[0_0_0_3px_color-mix(in_oklch,var(--accent)_22%,transparent)]",
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
