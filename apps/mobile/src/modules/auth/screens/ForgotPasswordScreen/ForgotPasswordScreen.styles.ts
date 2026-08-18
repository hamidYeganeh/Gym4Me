import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const forgotPasswordScreenVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    figureImage:
      "h-auto w-full max-w-[11.5rem] object-contain sm:max-w-[13rem]",
    submit:
      "min-h-14 bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
    backButton: "outline-none",
    footerCopy: "flex flex-col items-center gap-1 text-sm text-muted sm:text-base",
    footerLink:
      "font-bold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
  },
});

export type ForgotPasswordScreenVariants = VariantProps<
  typeof forgotPasswordScreenVariants
>;
