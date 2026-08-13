import { tv } from "tailwind-variants";

export const headerVariants = tv({
  slots: {
    root: [
      "sticky top-0 z-30 shrink-0 border-b-0",
      "bg-linear-to-t from-transparent via-background/90 to-background",
      "backdrop-blur-xl",
      "pt-[env(safe-area-inset-top)]",
    ].join(" "),
    bar: "relative z-10 flex min-h-16 items-center gap-3 px-screen py-2.5",
    start: [
      "relative z-10 flex w-11 shrink-0 items-center justify-start",
      "[&_button]:rounded-[0.875rem] [&_a]:rounded-[0.875rem]",
    ].join(" "),
    title:
      "pointer-events-none absolute inset-x-0 top-1/2 z-0 min-w-0 -translate-y-1/2 truncate px-16 text-center text-foreground tracking-tight",
    end: [
      "relative z-10 ms-auto flex w-11 shrink-0 items-center justify-end gap-2",
      "[&_button]:rounded-[0.875rem] [&_a]:rounded-[0.875rem]",
    ].join(" "),
  },
});
