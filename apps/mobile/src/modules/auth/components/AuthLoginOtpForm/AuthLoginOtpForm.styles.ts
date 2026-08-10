import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginOtpFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    codeArea: "flex flex-col items-center gap-5",
    otp: "w-full",
    otpGroup: "flex w-full justify-center gap-2.5 [direction:ltr] sm:gap-3",
    otpSlot:
      "size-12 rounded-2xl border border-border bg-field text-xl font-bold text-foreground shadow-none transition-[border-color,box-shadow,background-color,color] duration-fast ease-app data-[active=true]:border-accent data-[active=true]:text-accent data-[active=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)] dark:border-border/80 dark:bg-surface sm:size-14",
    debugPanel:
      "flex items-center justify-between gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3",
    debugCopy: "flex min-w-0 items-center gap-3",
    debugLabel: "text-xs font-semibold text-warning",
    debugCode:
      "text-lg font-black tracking-[0.25em] text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
    debugAction:
      "shrink-0 font-semibold text-warning data-[hovered=true]:bg-warning/10",
    errorBanner:
      "flex items-start justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-sm font-semibold text-danger",
    errorDismiss:
      "shrink-0 text-danger outline-none data-[hovered=true]:bg-danger/10",
    notice: "text-center text-sm text-success",
    submit:
      "mt-2 min-h-14 rounded-2xl bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
    resendRow:
      "flex min-h-8 flex-col items-center justify-center gap-1 text-center text-sm",
    resend:
      "inline h-auto min-h-0 px-0 py-0 font-bold text-accent underline-offset-4 outline-none data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80 data-[hovered=true]:underline",
    resendMuted: "text-muted",
    timer:
      "font-bold text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
  },
});

export type AuthLoginOtpFormVariants = VariantProps<
  typeof authLoginOtpFormVariants
>;
