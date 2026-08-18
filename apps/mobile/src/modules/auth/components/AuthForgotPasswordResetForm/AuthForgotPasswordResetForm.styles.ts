import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authForgotPasswordResetFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    strength: "flex flex-col gap-2",
    strengthBars: "grid grid-cols-4 gap-2",
    strengthBar: "h-1.5 rounded-full bg-separator",
    strengthBarActive: "bg-accent",
    strengthMessage: "text-foreground/90",
    submit:
      "min-h-14 bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
  },
});

export type AuthForgotPasswordResetFormVariants = VariantProps<
  typeof authForgotPasswordResetFormVariants
>;
