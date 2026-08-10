import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginPasswordFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    inputWrap: "relative",
    inputIcon:
      "pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-muted",
    input:
      "min-h-14 rounded-full border border-border/40 bg-field px-5 ps-12 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app data-[focus-visible=true]:border-accent data-[focus-visible=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_25%,transparent)]",
    inputWithSuffix: "pe-12",
    suffixButton:
      "absolute end-1.5 top-1/2 z-10 -translate-y-1/2 text-muted outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    row: "mt-2 flex items-center justify-between gap-3",
    remember: "text-sm font-semibold text-foreground",
    forgot:
      "shrink-0 text-sm font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    submit:
      "mt-1 min-h-14 rounded-full text-base font-semibold text-accent-foreground",
    submitIcon: "ms-2 size-6",
    divider:
      "flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted",
    dividerLine: "h-px flex-1 bg-separator",
    otpSubmit:
      "min-h-14 rounded-full border border-border/60 bg-transparent text-base font-semibold text-foreground",
    error: "text-sm text-danger",
  },
});

export type AuthLoginPasswordFormVariants = VariantProps<
  typeof authLoginPasswordFormVariants
>;
