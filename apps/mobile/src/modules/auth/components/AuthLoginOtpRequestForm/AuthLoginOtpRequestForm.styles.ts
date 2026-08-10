import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginOtpRequestFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    errorBanner:
      "flex items-start justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-sm font-semibold text-danger",
    errorDismiss:
      "shrink-0 text-danger outline-none data-[hovered=true]:bg-danger/10",
    submit:
      "mt-2 min-h-14 rounded-2xl bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
  },
});

export type AuthLoginOtpRequestFormVariants = VariantProps<
  typeof authLoginOtpRequestFormVariants
>;
