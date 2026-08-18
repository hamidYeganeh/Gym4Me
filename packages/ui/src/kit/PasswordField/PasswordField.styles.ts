import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const passwordFieldVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    label: "text-sm font-bold",
    /** Size only — colors/ring come from HeroUI InputGroup. */
    group:
      "min-h-[var(--auth-field-height)] rounded-[var(--auth-field-radius)]",
    prefixIcon: "size-[22px] shrink-0",
    input: "min-w-0 text-base sm:text-base",
    suffixButton:
      "outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
  },
  variants: {
    hideLabel: {
      true: {
        label: "sr-only",
      },
    },
  },
  defaultVariants: {
    hideLabel: false,
  },
});

export type PasswordFieldVariantProps = VariantProps<
  typeof passwordFieldVariants
>;
