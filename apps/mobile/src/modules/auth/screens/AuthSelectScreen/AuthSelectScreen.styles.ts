import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authSelectScreenVariants = tv({
  slots: {
    actions: "flex w-full flex-col gap-3",
    biometric: "mb-2 flex flex-col items-center gap-4",
    biometricFrame: "text-white/55",
    biometricButton:
      "min-h-14 w-full justify-center gap-3 rounded-full bg-white/10 px-5 text-base font-semibold text-white backdrop-blur-sm data-[hovered=true]:bg-white/15 data-[pressed=true]:opacity-80",
    biometricIcon: "size-5 shrink-0 text-accent",
    biometricError: "text-center text-sm font-medium text-danger",
    method:
      "min-h-14 w-full justify-start gap-3 rounded-full px-5 text-base font-semibold",
    methodLogin:
      "bg-foreground text-background data-[hovered=true]:opacity-90 data-[pressed=true]:opacity-80",
    methodOtp:
      "bg-accent text-accent-foreground data-[hovered=true]:opacity-90 data-[pressed=true]:opacity-80",
    methodIcon: "size-5 shrink-0",
    footer: "text-sm text-white/80",
    footerLink:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
  },
});

export type AuthSelectScreenVariants = VariantProps<
  typeof authSelectScreenVariants
>;
