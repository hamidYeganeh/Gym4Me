import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const phoneFieldVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    field: [
      "flex min-h-[var(--auth-field-height)] flex-row items-center gap-3",
      "rounded-[var(--auth-field-radius)] border border-border bg-field px-4",
      "[direction:ltr] transition-[border-color,box-shadow,background-color]",
      "duration-fast ease-app",
      "focus-within:border-accent focus-within:shadow-[var(--auth-focus-ring)]",
      "dark:border-border/80 dark:bg-surface",
    ].join(" "),
    country:
      "flex shrink-0 flex-row items-center gap-1.5 text-sm font-semibold text-foreground",
    countryFlag: "text-base leading-none",
    countryCode: "tracking-wide",
    divider: "h-6 w-px bg-border",
    input: [
      "min-h-12 flex-1 border-0 bg-transparent px-0 text-base text-foreground",
      "shadow-none outline-none placeholder:text-muted",
    ].join(" "),
  },
  variants: {
    isInvalid: {
      true: {
        field:
          "border-danger focus-within:border-danger focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--danger)_22%,transparent)]",
      },
    },
  },
  defaultVariants: {
    isInvalid: false,
  },
});

export type PhoneFieldVariantProps = VariantProps<typeof phoneFieldVariants>;
