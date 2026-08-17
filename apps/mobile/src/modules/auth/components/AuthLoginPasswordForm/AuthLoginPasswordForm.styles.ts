import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginPasswordFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    row: "flex items-center justify-between gap-3",
    remember: "text-foreground",
    forgot:
      "shrink-0 text-sm font-bold text-accent outline-none data-[hovered=true]:opacity-80",
    submit:
      "mt-2 min-h-14 rounded-2xl bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
  },
});

export type AuthLoginPasswordFormVariants = VariantProps<
  typeof authLoginPasswordFormVariants
>;
