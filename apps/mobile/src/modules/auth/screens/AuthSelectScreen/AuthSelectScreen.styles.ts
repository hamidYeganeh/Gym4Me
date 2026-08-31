import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authSelectScreenVariants = tv({
  slots: {
    actions: "flex w-full flex-col gap-3",
    biometricButton: [
      "h-auto min-h-0 w-auto min-w-0 bg-transparent p-0 text-foreground shadow-none",
      "data-[hovered=true]:bg-transparent data-[hovered=true]:text-foreground/80",
      "data-[pressed=true]:scale-[0.98] data-[pressed=true]:opacity-90",
      "[&_svg]:pointer-events-none [&_svg]:m-0 [&_svg]:shrink-0",
    ],
    biometricMark: "relative flex size-32 items-center justify-center",
    biometricFrame: "absolute inset-0 !size-32 text-foreground",
    biometricGlyph: "relative z-[1] !size-28 text-zinc-500 dark:text-zinc-400",
    method:
      "w-full justify-center gap-3 text-center text-base font-semibold",
    methodLogin:
      "bg-foreground text-background data-[hovered=true]:opacity-90 data-[pressed=true]:opacity-80",
    methodOtp:
      "bg-accent text-accent-foreground data-[hovered=true]:opacity-90 data-[pressed=true]:opacity-80",
    methodIcon: "size-5 shrink-0",
  },
});

export type AuthSelectScreenVariants = VariantProps<
  typeof authSelectScreenVariants
>;
