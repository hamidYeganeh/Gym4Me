import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const carouselNavigationVariants = tv({
  slots: {
    root: [
      "inline-flex items-center justify-center gap-1",
      "rounded-full border border-border/70 bg-surface",
      "transition-colors duration-normal ease-app",
    ].join(" "),
    arrow: [
      "shrink-0 bg-accent text-accent-foreground shadow-sm",
      "data-[hovered=true]:bg-accent/90 data-[pressed=true]:scale-90",
      "data-[disabled=true]:bg-default data-[disabled=true]:text-muted data-[disabled=true]:opacity-60",
    ].join(" "),
    indicators: "flex items-center gap-1.5 px-1",
    indicator: [
      "relative h-2.5 cursor-pointer overflow-hidden rounded-full bg-accent/30",
      "outline-none transition-[width,background-color] duration-normal ease-app",
      "focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2",
    ].join(" "),
    progress: "absolute inset-y-0 start-0 rounded-full bg-accent",
  },
  variants: {
    size: {
      sm: {
        root: "gap-0.5 px-1 py-1",
        arrow: "h-8 w-8 min-h-8 min-w-8",
        indicator: "w-2.5 data-[active=true]:w-9",
      },
      md: {
        root: "gap-1 px-2 py-2",
        arrow: "h-12 w-12 min-h-12 min-w-12",
        indicator: "w-3 data-[active=true]:w-12",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type CarouselNavigationVariantProps = VariantProps<
  typeof carouselNavigationVariants
>;
