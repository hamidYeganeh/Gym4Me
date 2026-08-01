import { tv } from "tailwind-variants";

export const vaporizeVariants = tv({
  slots: {
    root: [
      "relative w-full overflow-visible",
      "transition-[height,margin,opacity] duration-moderate ease-app",
      "will-change-[height,opacity]",
    ].join(" "),
    content: "w-full",
    canvas: [
      "pointer-events-none absolute left-1/2 top-1/2 z-10",
      "-translate-x-1/2 -translate-y-1/2",
    ].join(" "),
  },
  variants: {
    phase: {
      idle: { root: "opacity-100" },
      capturing: { root: "opacity-100" },
      playing: { root: "opacity-100 overflow-visible" },
      collapsing: {
        root: "overflow-hidden opacity-0 pointer-events-none",
      },
    },
  },
  defaultVariants: {
    phase: "idle",
  },
});
