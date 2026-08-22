import { tv } from "tailwind-variants";

export const adminFilterSelectVariants = tv({
  slots: {
    root: "flex w-full min-w-[12rem] flex-col gap-2 sm:w-48",
    label: "text-sm font-semibold text-foreground",
    trigger: [
      "flex h-12 w-full items-center gap-3 rounded-[var(--field-radius)]",
      "border border-border bg-field px-4",
      "text-sm font-medium text-foreground shadow-none",
      "[--button-bg:var(--field-background)]",
      "[--button-bg-hover:var(--field-background)]",
      "[--button-bg-pressed:var(--field-background)]",
      "[--button-fg:var(--field-foreground)]",
    ].join(" "),
    value: "min-w-0 flex-1 truncate text-start",
    indicator: "shrink-0 text-muted",
  },
});
