import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authForgotPasswordOtpFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    hint: "text-center text-sm leading-6 text-muted",
    phoneValue:
      "font-bold text-foreground [direction:ltr] [unicode-bidi:isolate]",
    otpWrap: "flex w-full justify-center",
    otpGroup: "flex w-full justify-center gap-2 [direction:ltr] sm:gap-3",
    otpSlot:
      "size-12 rounded-2xl border border-border/60 bg-transparent text-xl font-bold text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app data-[active=true]:border-accent data-[active=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)] sm:size-14",
    error:
      "rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-center text-sm font-semibold text-danger",
    submit:
      "min-h-14 rounded-full text-base font-bold text-accent-foreground",
    submitIcon: "ms-2 size-5",
    resendRow:
      "flex min-h-10 items-center justify-center gap-2 text-sm text-muted",
    resend:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    timer:
      "font-bold text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
  },
});

export type AuthForgotPasswordOtpFormVariants = VariantProps<
  typeof authForgotPasswordOtpFormVariants
>;
