import { tv } from "tailwind-variants";

export const flagVariants = tv({
  slots: {
    root: "inline-flex shrink-0 overflow-hidden leading-none [&_svg]:block [&_svg]:size-full",
  },
  variants: {
    rounded: {
      true: { root: "rounded-full" },
      false: { root: "rounded-sm" },
    },
  },
  defaultVariants: {
    rounded: false,
  },
});
