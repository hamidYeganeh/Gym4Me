import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginOtpRequestFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    submit:
      "mt-2 min-h-14 rounded-2xl bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
  },
});

export type AuthLoginOtpRequestFormVariants = VariantProps<
  typeof authLoginOtpRequestFormVariants
>;
