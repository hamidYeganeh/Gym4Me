import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const filterFieldVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    label: "text-sm font-semibold text-foreground",
    trigger: [
      "flex h-12 w-full items-center gap-3 rounded-[var(--field-radius)]",
      "border border-border bg-field px-4 text-start",
      "text-foreground shadow-none",
      "transition-[border-color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:scale-[0.99]",
      "[--button-bg:var(--field-background)]",
      "[--button-bg-hover:var(--field-background)]",
      "[--button-bg-pressed:var(--field-background)]",
      "[--button-fg:var(--field-foreground)]",
    ].join(" "),
    icon: "inline-flex shrink-0 items-center justify-center text-muted [&_svg]:size-5",
    value: "min-w-0 flex-1 truncate text-sm font-medium text-foreground",
    trailing: "inline-flex shrink-0 items-center justify-center text-muted [&_svg]:size-5",
  },
});

export type FilterFieldVariantProps = VariantProps<typeof filterFieldVariants>;
