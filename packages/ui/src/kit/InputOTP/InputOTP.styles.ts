import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

/**
 * Size-only overrides for HeroUI InputOTP.
 * Slot colors / borders / states come from `@heroui/styles` — do not re-skin here.
 * Tokens: `--otp-slot-*` in `@repo/theme/tokens.css`.
 *
 * HeroUI slots ship with `h-10 w-9.5 flex-1` — auth (`md`) must clear the fixed
 * height so `aspect-square` can derive height from the flex width.
 */
export const inputOTPVariants = tv({
  slots: {
    root: "w-auto",
    group: "flex items-center justify-center [direction:ltr]",
    slot: "relative flex items-center justify-center",
  },
  variants: {
    size: {
      /** Gallery / showcase — fixed display slots */
      lg: {
        root: "gap-[var(--otp-slot-lg-gap)]",
        group: "gap-[var(--otp-slot-lg-gap)]",
        slot: [
          "!h-[var(--otp-slot-lg-height)] !w-[var(--otp-slot-lg-width)] !grow-0 !shrink-0 !flex-none !basis-auto",
          "!rounded-[var(--otp-slot-lg-radius)]",
          "text-4xl",
          // "!text-[length:var(--otp-slot-lg-font)]",
        ].join(" "),
      },
      /** Auth — equal square slots (`flex-1` + `aspect-square`) */
      md: {
        root: "w-full max-w-full gap-[var(--otp-slot-md-gap)]",
        group: "w-full items-stretch gap-[var(--otp-slot-md-gap)]",
        slot: [
          // Equal columns: flex width, then square height (overrides HeroUI `h-10`)
          "!min-w-0 !flex-1 !basis-0 !w-0",
          "!aspect-square !h-auto !max-h-none",
          "!rounded-[var(--otp-slot-md-radius)]",
          "!text-[length:var(--otp-slot-md-font)]",
        ].join(" "),
      },
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export type InputOTPVariantProps = VariantProps<typeof inputOTPVariants>;
