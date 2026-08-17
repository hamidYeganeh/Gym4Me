import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authForgotPasswordPhoneFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    submit:
      "min-h-14 rounded-full text-base font-bold text-accent-foreground",
    submitIcon: "ms-2 size-5",
  },
});

export type AuthForgotPasswordPhoneFormVariants = VariantProps<
  typeof authForgotPasswordPhoneFormVariants
>;
