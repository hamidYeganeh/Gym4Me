import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const baseProfileScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-5 pb-14",
  },
});

export type BaseProfileScreenVariants = VariantProps<
  typeof baseProfileScreenVariants
>;
