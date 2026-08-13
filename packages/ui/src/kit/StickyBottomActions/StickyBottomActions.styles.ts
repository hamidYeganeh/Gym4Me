import { tv } from "tailwind-variants";

export const stickyBottomActionsVariants = tv({
  slots: {
    root: [
      "pointer-events-none fixed inset-x-0 bottom-0 z-30 isolate",
      "mx-auto w-full max-w-xl overflow-hidden",
      "bg-linear-to-t from-background via-background/85 to-transparent",
      "px-4 pt-10",
      "pb-[max(0.85rem,env(safe-area-inset-bottom))]",
    ].join(" "),
    blur: "pointer-events-none absolute inset-0 z-0",
    content: [
      "pointer-events-auto relative z-10 mx-auto flex w-full max-w-lg",
      "rounded-[1.5rem] bg-surface p-2",
      "shadow-[0_14px_40px_color-mix(in_oklch,var(--foreground)_10%,transparent)]",
    ].join(" "),
  },
});
