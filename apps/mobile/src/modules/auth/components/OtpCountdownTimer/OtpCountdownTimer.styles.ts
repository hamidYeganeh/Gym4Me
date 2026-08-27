import { tv } from "tailwind-variants";

export const otpCountdownTimerVariants = tv({
  slots: {
    root: "inline-flex items-baseline gap-0.5 [direction:ltr]",
    digit:
      "inline-block align-baseline text-sm font-bold leading-none text-foreground [font-variant-numeric:tabular-nums] sm:text-base",
    separator: "select-none text-sm font-bold leading-none sm:text-base",
  },
});
