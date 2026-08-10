import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginPasswordFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    inputWrap:
      "relative flex min-h-14 items-center rounded-2xl border border-border bg-field transition-[border-color,box-shadow,background-color] duration-fast ease-app focus-within:border-accent focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)] dark:border-border/80 dark:bg-surface",
    inputIcon:
      "pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-muted",
    input:
      "min-h-14 w-full rounded-2xl border-0 bg-transparent px-5 ps-12 text-base text-foreground shadow-none outline-none placeholder:text-muted",
    inputWithSuffix: "pe-12",
    suffixButton:
      "absolute end-1.5 top-1/2 z-10 -translate-y-1/2 text-muted outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    row: "flex items-center justify-between gap-3",
    remember: "text-sm font-medium text-foreground",
    forgot:
      "shrink-0 text-sm font-bold text-accent outline-none data-[hovered=true]:opacity-80",
    submit:
      "mt-2 min-h-14 rounded-2xl bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
    errorBanner:
      "flex items-start justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-sm font-semibold text-danger",
    errorDismiss:
      "shrink-0 text-danger outline-none data-[hovered=true]:bg-danger/10",
  },
});

export type AuthLoginPasswordFormVariants = VariantProps<
  typeof authLoginPasswordFormVariants
>;
