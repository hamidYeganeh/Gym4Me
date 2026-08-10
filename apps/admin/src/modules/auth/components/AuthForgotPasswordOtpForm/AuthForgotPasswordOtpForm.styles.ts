import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authForgotPasswordOtpFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-4",
    hint: "text-sm text-muted",
    otpWrap: "flex justify-center",
    submit:
      "mt-1 min-h-14 rounded-full text-base font-semibold text-accent-foreground",
    error: "text-sm text-danger",
  },
});

export type AuthForgotPasswordOtpFormVariants = VariantProps<
  typeof authForgotPasswordOtpFormVariants
>;
