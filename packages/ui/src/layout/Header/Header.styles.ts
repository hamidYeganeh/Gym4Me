import { tv } from "tailwind-variants";

export const headerVariants = tv({
  slots: {
    root: "shrink-0 border-b border-border bg-surface pt-[env(safe-area-inset-top)]",
    bar: "relative flex items-center gap-3 px-screen py-3",
    start: "relative z-10 flex w-10 shrink-0 items-center justify-start",
    title:
      "pointer-events-none absolute inset-x-0 top-1/2 z-0 min-w-0 -translate-y-1/2 truncate px-14 text-center text-foreground",
    end: "relative z-10 ms-auto flex w-10 shrink-0 items-center justify-end gap-2",
  },
});
