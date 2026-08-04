import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const quickActionCardVariants = tv({
  slots: {
    root: [
      // Override HeroUI Button defaults (h-10, inline-flex, items-center, etc.)
      "group !flex h-full w-full min-h-0 min-w-0 flex-col items-stretch justify-start gap-2",
      "bg-transparent p-0 shadow-none whitespace-normal",
      "transition-transform duration-fast ease-app",
      "data-[pressed=true]:scale-[0.97]",
      "outline-none hover:bg-transparent data-[hovered=true]:bg-transparent",
    ].join(" "),
    tile: [
      "flex aspect-square w-full shrink-0 items-center justify-center",
      "rounded-[22px] bg-default text-foreground",
      "transition-colors duration-fast ease-app",
      "group-data-[hovered=true]:bg-default/80",
      "group-data-[pressed=true]:bg-default/70",
    ].join(" "),
    icon: "inline-flex items-center justify-center text-foreground [&_svg]:!size-7",
    label: [
      "block h-8 w-full px-0.5",
      "text-center leading-tight text-foreground",
      "line-clamp-2 overflow-hidden",
    ].join(" "),
  },
});

export type QuickActionCardVariantProps = VariantProps<
  typeof quickActionCardVariants
>;
