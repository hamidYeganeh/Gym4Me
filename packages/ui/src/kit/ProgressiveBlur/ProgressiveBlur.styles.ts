import { tv } from "tailwind-variants";

export const GRADIENT_ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
} as const;

export const progressiveBlurVariants = tv({
  slots: {
    root: "relative",
    layer: "pointer-events-none absolute inset-0 rounded-[inherit]",
  },
});
