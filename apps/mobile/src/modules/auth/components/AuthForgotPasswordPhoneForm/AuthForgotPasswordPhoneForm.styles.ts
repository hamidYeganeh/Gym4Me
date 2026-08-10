import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authForgotPasswordPhoneFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    inputWrap: "relative",
    inputIcon:
      "pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-muted",
    input:
      "min-h-14 rounded-full border border-border/60 bg-transparent px-5 ps-12 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app placeholder:text-muted data-[focus-visible=true]:border-accent data-[focus-visible=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)]",
    error:
      "rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-center text-sm font-semibold text-danger",
    submit:
      "min-h-14 rounded-full text-base font-bold text-accent-foreground",
    submitIcon: "ms-2 size-5",
  },
});

export type AuthForgotPasswordPhoneFormVariants = VariantProps<
  typeof authForgotPasswordPhoneFormVariants
>;
