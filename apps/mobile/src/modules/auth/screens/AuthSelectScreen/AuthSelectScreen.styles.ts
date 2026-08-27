import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authSelectScreenVariants = tv({
  slots: {
    actions: "flex w-full flex-col gap-3",
    biometric: "mb-5 flex flex-col items-center",
    biometricButton: [
      "relative size-40 min-h-40 min-w-40 overflow-visible p-0",
      "rounded-none bg-transparent text-foreground shadow-none",
      "data-[hovered=true]:bg-transparent data-[hovered=true]:text-foreground/80",
      "data-[pressed=true]:scale-95 data-[pressed=true]:opacity-90",
      "[&_svg]:pointer-events-none [&_svg]:m-0 [&_svg]:shrink-0",
    ],
    biometricMark: "relative flex size-40 items-center justify-center",
    biometricFrame: "absolute inset-0 !size-40 text-foreground",
    biometricGlyph: "relative z-[1] !h-[8.75rem] !w-[7rem] text-zinc-800",
    method:
      "min-h-14 w-full justify-center gap-3 rounded-full px-5 text-center text-base font-semibold",
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
