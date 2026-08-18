import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const phoneFieldVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    label: "text-sm font-bold",
    group:
      "min-h-[var(--auth-field-height)] rounded-[var(--auth-field-radius)] [direction:ltr] [unicode-bidi:isolate]",
    country:
      "flex shrink-0 flex-row items-center gap-1.5 pe-0 text-sm font-semibold",
    countryFlag:
      "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-base leading-none [&_svg]:size-full",
    countryChevron: "size-3.5 shrink-0 text-muted",
    countryCode: "tracking-wide tabular-nums",
    divider: "mx-1 h-5 w-px shrink-0 bg-current opacity-20",
    input:
      "min-w-0 ps-2 text-start text-base tabular-nums [unicode-bidi:isolate] sm:text-base",
    helpTrigger:
      "inline-flex size-6 shrink-0 items-center justify-center rounded-full outline-none data-[pressed=true]:opacity-80",
    helpIcon: "size-5",
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

export type PhoneFieldVariantProps = VariantProps<typeof phoneFieldVariants>;
