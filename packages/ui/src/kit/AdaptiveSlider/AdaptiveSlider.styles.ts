import { tv } from "tailwind-variants";

export const adaptiveSliderVariants = tv({
  slots: {
    root: "flex w-full flex-col items-center justify-center select-none",
    label: "mb-2 text-xl font-bold text-muted sm:text-2xl",
    valueRow: "mb-6 flex items-baseline gap-2",
    value:
      "overflow-hidden text-5xl font-extrabold tracking-tight transition-colors duration-moderate ease-app sm:text-6xl",
    unit: "text-4xl font-extrabold text-foreground transition-colors duration-moderate ease-app sm:text-5xl",
    track:
      "group relative flex h-13 w-full items-center overflow-hidden rounded-full bg-default transition-colors duration-moderate ease-app",
    dots: "pointer-events-none absolute inset-0 flex items-center justify-between px-4 transition-colors duration-moderate ease-app sm:px-8",
    dot: "z-30 h-1.5 w-1.5 rounded-full bg-muted/40 transition-colors duration-moderate ease-app",
    fill: "pointer-events-none absolute top-0 left-0 h-full rounded-full",
    input:
      "absolute inset-0 z-50 h-13 w-full cursor-[var(--pointer-cursor)] opacity-0",
    thumb:
      "pointer-events-none absolute top-0 z-40 flex size-13 items-center justify-center rounded-full border-none",
    thumbInner:
      "size-10 rounded-full bg-surface shadow-[inset_0_2px_4px_color-mix(in_oklab,var(--foreground)_6%,transparent)]",
    animatedText: "flex text-lg tracking-tight will-change-transform",
  },
  variants: {
    valueSpacing: {
      default: {},
      spaced: { valueRow: "mb-8" },
    },
    tone: {
      low: {
        value: "text-success",
        fill: "bg-linear-to-r from-warning to-accent",
      },
      mid: {
        value: "text-warning",
        fill: "bg-linear-to-r from-warning/35 to-warning",
      },
      high: {
        value: "text-danger",
        fill: "bg-linear-to-r from-warning to-danger",
      },
    },
  },
  defaultVariants: {
    valueSpacing: "default",
    tone: "low",
  },
});
