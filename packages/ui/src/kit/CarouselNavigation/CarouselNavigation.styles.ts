import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const carouselNavigationVariants = tv({
  slots: {
    root: [
      "inline-flex items-center justify-center gap-0.5",
      "rounded-full border border-border/70 bg-default",
      "transition-colors duration-normal ease-app",
    ].join(" "),
    arrow: ["shrink-0 shadow-none", "data-[pressed=true]:scale-90"].join(" "),
  },
  variants: {
    size: {
      sm: {
        root: "gap-0.5 px-1 py-1",
        arrow: "h-8 w-8 min-h-8 min-w-8",
      },
      md: {
        root: "gap-1 px-2 py-2",
        arrow: "h-12 w-12 min-h-12 min-w-12",
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
