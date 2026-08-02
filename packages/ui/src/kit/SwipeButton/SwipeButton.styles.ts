import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const swipeButtonVariants = tv({
  slots: {
    root: [
      "relative flex h-16 w-full touch-none items-center overflow-hidden",
      "rounded-full select-none transition-opacity duration-normal ease-app",
      "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
    ].join(" "),
    label: [
      "pointer-events-none absolute inset-0 z-0 flex items-center justify-center",
      "px-16 text-center font-semibold tracking-wide",
      "transition-opacity duration-normal ease-app",
    ].join(" "),
    thumb: [
      "absolute top-1.5 bottom-1.5 start-1.5 z-10 flex aspect-square",
      "cursor-[var(--pointer-cursor)] items-center justify-center",
      "rounded-[18px] shadow-sm outline-none",
      "transition-[box-shadow] duration-fast ease-app",
      "data-[dragging=true]:shadow-md",
      "focus-visible:ring-2 focus-visible:ring-background/70 focus-visible:ring-offset-2",
      "focus-visible:ring-offset-transparent",
    ].join(" "),
    icon: "size-6 shrink-0",
  },
  variants: {
    color: {
      accent: {
        root: "bg-accent text-accent-foreground",
        thumb: "bg-accent-foreground text-accent",
      },
      danger: {
        root: "bg-danger text-danger-foreground",
        thumb: "bg-danger-foreground text-danger",
      },
      success: {
        root: "bg-success text-success-foreground",
        thumb: "bg-success-foreground text-success",
      },
      orange: {
        root: "bg-stats-orange text-stats-foreground",
        thumb: "bg-stats-foreground text-stats-orange",
      },
    },
  },
  defaultVariants: {
    color: "accent",
  },
});

export type SwipeButtonVariantProps = VariantProps<typeof swipeButtonVariants>;
