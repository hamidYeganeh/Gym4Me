import { tv } from "tailwind-variants";

export const heightSliderVariants = tv({
  slots: {
    root: [
      "relative mx-auto w-full max-w-[12rem] touch-none select-none",
      "text-foreground",
    ].join(" "),
    highlight:
      "pointer-events-none absolute inset-x-2 top-1/2 z-0 h-14 -translate-y-1/2 rounded-full border border-accent bg-accent/10",
    column:
      "relative z-10 h-[280px] snap-y snap-mandatory overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    pad: "h-[112px] shrink-0",
    item:
      "flex h-14 shrink-0 snap-center items-center justify-center tabular-nums transition-[color,font-size,font-weight,opacity] duration-150",
  },
  variants: {
    active: {
      true: {
        item: "text-[2.35rem] font-bold text-accent",
      },
      false: {
        item: "text-2xl font-semibold text-muted",
      },
    },
    near: {
      true: {
        item: "opacity-90",
      },
      false: {
        item: "opacity-45",
      },
    },
  },
  defaultVariants: {
    active: false,
    near: false,
  },
});
