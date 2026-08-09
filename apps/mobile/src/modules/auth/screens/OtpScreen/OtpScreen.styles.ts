import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const otpScreenVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-6",
    codeArea: "flex flex-col items-center gap-3",
    otp: "w-full",
    otpGroup: "flex w-full justify-center gap-2 [direction:ltr] sm:gap-3",
    otpSlot:
      "size-12 rounded-2xl border border-border/50 bg-transparent text-xl font-bold text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app data-[active=true]:border-accent data-[active=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)] sm:size-14",
    phone: "text-center text-sm leading-6 text-muted",
    phoneValue:
      "font-bold text-foreground [direction:ltr] [unicode-bidi:isolate]",
    debugPanel:
      "flex items-center justify-between gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3",
    debugCopy: "flex min-w-0 items-center gap-3",
    debugLabel: "text-xs font-semibold text-warning",
    debugCode:
      "text-lg font-black tracking-[0.25em] text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
    debugAction:
      "shrink-0 font-semibold text-warning data-[hovered=true]:bg-warning/10",
    error:
      "rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-center text-sm font-semibold text-danger",
    notice: "text-center text-sm text-success",
    submit:
      "min-h-14 rounded-2xl text-base font-bold text-accent-foreground",
    submitIcon: "ms-2 size-5",
    resendRow:
      "flex min-h-10 items-center justify-center gap-2 text-sm text-muted",
    resend:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    timer:
      "font-bold text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
    back:
      "mx-auto flex w-fit items-center gap-2 text-sm font-semibold text-muted outline-none data-[hovered=true]:text-foreground",
  },
});

export type OtpScreenVariants = VariantProps<typeof otpScreenVariants>;
