import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const signInScreenVariants = tv({
  slots: {
    backButton: "outline-none",
    figureImage:
      "h-auto w-full max-w-[11.5rem] object-contain sm:max-w-[13rem]",
  },
});

export type SignInScreenVariants = VariantProps<typeof signInScreenVariants>;
