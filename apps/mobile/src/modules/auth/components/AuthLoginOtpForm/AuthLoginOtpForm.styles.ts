import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginOtpFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-10",
    codeArea: "flex flex-col items-center gap-6",
    otpWrap: "flex w-full flex-col items-center gap-2",
    debugPanel:
      "flex items-center justify-between gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3",
    debugCopy: "flex min-w-0 items-center gap-3",
    debugLabel: "text-warning",
    debugCode:
      "text-lg font-black tracking-[0.25em] text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
    debugAction:
      "shrink-0 font-semibold text-warning data-[hovered=true]:bg-warning/10",
    submit: "mt-2 min-h-14 font-bold",
    submitIcon: "ms-2 size-5",
    resendRow:
      "flex min-h-8 w-full flex-col items-center justify-center gap-1 text-center",
    resend: "font-bold text-stats-blue",
    resendCountdown:
      "inline-flex items-baseline justify-center gap-1 text-center text-sm text-muted sm:text-base",
  },
});

export type AuthLoginOtpFormVariants = VariantProps<
  typeof authLoginOtpFormVariants
>;
