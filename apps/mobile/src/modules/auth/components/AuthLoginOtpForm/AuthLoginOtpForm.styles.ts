import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const authLoginOtpFormVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    codeArea: "flex flex-col items-center gap-5",
    otpWrap: "flex w-full flex-col items-center gap-2",
    debugPanel:
      "flex items-center justify-between gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3",
    debugCopy: "flex min-w-0 items-center gap-3",
    debugLabel: "text-warning",
    debugCode:
      "text-lg font-black tracking-[0.25em] text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
    debugAction:
      "shrink-0 font-semibold text-warning data-[hovered=true]:bg-warning/10",
    notice: "text-center text-success",
    submit:
      "mt-2 min-h-14 rounded-2xl bg-accent text-base font-bold text-accent-foreground data-[hovered=true]:opacity-90",
    submitIcon: "ms-2 size-5",
    resendRow:
      "flex min-h-8 flex-col items-center justify-center gap-1 text-center",
    resend:
      "inline h-auto min-h-0 px-0 py-0 font-bold text-accent underline-offset-4 outline-none data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80 data-[hovered=true]:underline",
    resendMuted: "text-muted",
    timer:
      "text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
  },
});

export type AuthLoginOtpFormVariants = VariantProps<
  typeof authLoginOtpFormVariants
>;
