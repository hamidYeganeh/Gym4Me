import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const baseProfileScreenVariants = tv({
  slots: {
    root: "bg-background before:hidden",
    content: "flex flex-col gap-6 pb-14",
  },
});

export type BaseProfileScreenVariants = VariantProps<
  typeof baseProfileScreenVariants
>;
