import { tv } from "tailwind-variants";

export const headerVariants = tv({
  slots: {
    root: [
      "sticky top-0 z-30 shrink-0 border-b-0",
      "pt-[env(safe-area-inset-top)]",
    ].join(" "),
    /** Fixed 72px content row — title always centered between side slots. */
    bar: [
      "relative z-10 grid h-[72px] min-h-[72px] w-full",
      "grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 px-screen",
    ].join(" "),
    start: [
      "relative z-10 flex size-11 shrink-0 items-center justify-start",
      "[&_button]:rounded-full [&_a]:rounded-full",
    ].join(" "),
    title:
      "z-0 min-w-0 truncate text-center text-base font-semibold leading-tight tracking-tight text-foreground",
    end: [
      "relative z-10 flex size-11 shrink-0 items-center justify-end gap-2",
      "[&_button]:rounded-full [&_a]:rounded-full",
    ].join(" "),
  },
  variants: {
    appearance: {
      fade: {
        root: "bg-linear-to-t from-transparent via-background/90 to-background backdrop-blur-xl",
      },
      bar: {
        root: "overflow-hidden rounded-b-[2.5rem] bg-surface",
      },
    },
  },
  defaultVariants: {
    appearance: "fade",
  },
});
