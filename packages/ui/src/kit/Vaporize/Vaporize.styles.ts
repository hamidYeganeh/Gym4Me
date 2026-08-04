import { tv } from "tailwind-variants";

export const vaporizeVariants = tv({
  slots: {
    root: "relative w-full",
    shell: [
      "grid w-full transition-[grid-template-rows,opacity] duration-moderate ease-app",
      "motion-reduce:transition-none",
    ].join(" "),
    shellInner: "min-h-0 overflow-hidden",
    content: "relative w-full",
    canvas: [
      "pointer-events-none absolute left-1/2 top-1/2 z-10",
      "-translate-x-1/2 -translate-y-1/2",
    ].join(" "),
  },
  variants: {
    phase: {
      idle: {
        shell: "grid-rows-[1fr] opacity-100",
      },
      capturing: {
        shell: "grid-rows-[1fr] opacity-100",
      },
      playing: {
        shell: "grid-rows-[1fr] opacity-100 overflow-visible",
        content: "invisible",
      },
      done: {
        shell: "grid-rows-[0fr] opacity-0 pointer-events-none",
        content: "invisible",
      },
    },
  },
  defaultVariants: {
    phase: "idle",
  },
});
