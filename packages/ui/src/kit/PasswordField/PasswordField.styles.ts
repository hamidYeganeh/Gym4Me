import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const passwordFieldVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    inputWrap: [
      "relative flex min-h-[var(--auth-field-height)] items-center",
      "rounded-[var(--auth-field-radius)] border border-border bg-field",
      "transition-[border-color,box-shadow,background-color] duration-fast ease-app",
      "focus-within:border-accent focus-within:shadow-[var(--auth-focus-ring)]",
      "dark:border-border/80 dark:bg-surface",
    ].join(" "),
    inputIcon:
      "pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-muted",
    input: [
      "min-h-[var(--auth-field-height)] w-full rounded-[var(--auth-field-radius)]",
      "border-0 bg-transparent px-5 ps-12 text-base text-foreground",
      "shadow-none outline-none placeholder:text-muted",
    ].join(" "),
    inputWithSuffix: "pe-12",
    suffixButton: [
      "absolute end-1.5 top-1/2 z-10 -translate-y-1/2 text-muted outline-none",
      "data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    ].join(" "),
  },
  variants: {
    isInvalid: {
      true: {
        inputWrap:
          "border-danger focus-within:border-danger focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--danger)_22%,transparent)]",
      },
    },
  },
  defaultVariants: {
    isInvalid: false,
  },
});

export type PasswordFieldVariantProps = VariantProps<
  typeof passwordFieldVariants
>;
