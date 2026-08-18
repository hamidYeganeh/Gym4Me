import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const signInScreenVariants = tv({
  slots: {
    footer: "text-sm text-muted sm:text-base",
    footerLink:
      "font-bold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    backButton: "outline-none",
    figureImage:
      "h-auto w-full max-w-[11.5rem] object-contain sm:max-w-[13rem]",
  },
});

export type SignInScreenVariants = VariantProps<typeof signInScreenVariants>;
