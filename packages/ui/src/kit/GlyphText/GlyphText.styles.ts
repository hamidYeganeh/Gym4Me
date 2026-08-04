import { tv } from "tailwind-variants";

export const glyphTextVariants = tv({
  slots: {
    root: "align-bottom leading-[100%] text-inherit",
  },
  variants: {
    multi: {
      true: {
        root: "inline-block overflow-hidden whitespace-nowrap align-middle",
      },
      false: {
        root: "",
      },
    },
    fixedWidth: {
      true: {
        root: "text-center",
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    multi: false,
    fixedWidth: false,
  },
});
