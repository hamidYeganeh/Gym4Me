import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authForgotPasswordOtpFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    hint: "text-center text-muted",
    phoneValue:
      "text-foreground [direction:ltr] [unicode-bidi:isolate]",
    otpWrap: "flex w-full flex-col items-center gap-2",
    submit:
      "min-h-14 bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
    resendRow:
      "flex min-h-10 items-center justify-center gap-2 text-muted",
    resend:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    timer:
      "text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
  },
});

export type AuthForgotPasswordOtpFormVariants = VariantProps<
  typeof authForgotPasswordOtpFormVariants
>;
