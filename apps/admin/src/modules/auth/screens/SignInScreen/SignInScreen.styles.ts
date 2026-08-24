import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const signInScreenVariants = tv({
  slots: {
    figureImage:
      "h-auto w-full max-w-[11.5rem] object-contain sm:max-w-[13rem]",
    forgot:
      "shrink-0 text-sm font-bold text-accent outline-none data-[hovered=true]:opacity-80",
  },
});

export type SignInScreenVariants = VariantProps<typeof signInScreenVariants>;
