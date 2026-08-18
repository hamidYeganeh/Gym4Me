import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authForgotPasswordPhoneFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-8",
    submit:
      "mt-1 min-h-14 bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
  },
});

export type AuthForgotPasswordPhoneFormVariants = VariantProps<
  typeof authForgotPasswordPhoneFormVariants
>;
