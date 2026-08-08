import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const signInScreenVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    inputWrap: "relative",
    inputIcon:
      "pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-muted",
    input:
      "min-h-14 rounded-[1.2rem] border border-transparent bg-field px-4 ps-12 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app data-[focus-visible=true]:border-accent data-[focus-visible=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_25%,transparent)]",
    inputWithSuffix: "pe-12",
    suffixButton:
      "absolute end-1.5 top-1/2 z-10 -translate-y-1/2 text-muted outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    submit:
      "mt-2 min-h-16 rounded-[1.3rem] text-lg font-semibold text-accent-foreground",
    submitIcon: "ms-2 size-6",
    divider: "flex items-center gap-3 text-xs font-semibold text-muted",
    dividerLine: "h-px flex-1 bg-separator",
    passwordSubmit:
      "min-h-14 rounded-[1.2rem] text-base font-semibold text-foreground",
    error: "text-sm text-danger",
    forgot:
      "text-center text-sm font-semibold text-accent outline-none data-[hovered=true]:opacity-80",
  },
});

export type SignInScreenVariants = VariantProps<typeof signInScreenVariants>;
