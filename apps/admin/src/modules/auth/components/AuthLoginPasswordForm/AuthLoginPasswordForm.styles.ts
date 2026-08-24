import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginPasswordFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    row: "flex items-center justify-between gap-3",
    remember: "text-sm text-foreground",
    forgot:
      "shrink-0 text-sm font-bold text-accent outline-none data-[hovered=true]:opacity-80",
    submit:
      "mt-2 min-h-14 rounded-2xl bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
    divider:
      "flex w-full items-center gap-3 text-xs font-medium tracking-wide text-muted sm:text-sm",
    dividerLine: "h-px flex-1 bg-separator",
    otpSubmit:
      "min-h-14 w-full justify-center gap-3 rounded-2xl border border-border/80 bg-surface/90 text-base font-semibold text-foreground backdrop-blur-sm data-[hovered=true]:bg-surface-secondary data-[pressed=true]:opacity-80 dark:border-border dark:bg-surface/80",
    otpIcon: "size-5 shrink-0 text-accent",
    error: "text-sm text-danger",
  },
});

export type AuthLoginPasswordFormVariants = VariantProps<
  typeof authLoginPasswordFormVariants
>;
