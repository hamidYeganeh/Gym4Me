import { tv } from "tailwind-variants";

export const vaporizeTextVariants = tv({
  slots: {
    root: "relative h-full w-full pointer-events-none",
    canvas: "min-h-5 min-w-[30px] pointer-events-none",
    seo: "pointer-events-none absolute size-0 overflow-hidden select-none",
  },
});
