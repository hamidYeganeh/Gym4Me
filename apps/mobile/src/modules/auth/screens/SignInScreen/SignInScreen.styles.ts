import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const signInScreenVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    modeGroup: "mb-1 w-full overflow-hidden rounded-2xl border border-border/50 bg-field/40 p-1",
    modeButton:
      "min-h-11 flex-1 rounded-xl text-sm font-semibold text-muted data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[selected=true]:shadow-none",
    field: "flex w-full flex-col gap-2",
    inputWrap: "relative",
    inputIcon:
      "pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-foreground/80",
    input:
      "min-h-14 rounded-2xl border border-border/50 bg-transparent px-5 ps-12 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app placeholder:text-muted data-[focus-visible=true]:border-accent data-[focus-visible=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)]",
    inputWithSuffix: "pe-12",
    suffixButton:
      "absolute end-1.5 top-1/2 z-10 -translate-y-1/2 text-muted outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    row: "flex items-center justify-between gap-3",
    remember: "text-sm font-medium text-foreground",
    forgot:
      "shrink-0 text-sm font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    submit:
      "mt-1 min-h-14 rounded-2xl text-base font-bold text-accent-foreground",
    submitIcon: "ms-2 size-5",
    errorBanner:
      "flex items-start justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-sm font-semibold text-danger",
    errorDismiss:
      "shrink-0 text-danger outline-none data-[hovered=true]:bg-danger/10",
    footerLink:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
  },
});

export type SignInScreenVariants = VariantProps<typeof signInScreenVariants>;
