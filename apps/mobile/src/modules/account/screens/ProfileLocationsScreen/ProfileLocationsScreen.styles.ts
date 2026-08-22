import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileLocationsScreenVariants = tv({
  slots: {
    root: "bg-background before:hidden",
    content: "flex flex-col gap-6 pb-12 pt-2",
    intro: "flex flex-col gap-1 px-1",
    introTitle: "text-foreground",
    introSubtitle: "text-muted",
    add: "min-h-12",
  },
});

export type ProfileLocationsScreenVariants = VariantProps<
  typeof profileLocationsScreenVariants
>;
