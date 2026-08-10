import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const forgotPasswordScreenVariants = tv({
  slots: {
    form: "flex w-full flex-col gap-5",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    inputWrap: "relative",
    inputIcon:
      "pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-muted",
    input:
      "min-h-14 rounded-full border border-border/60 bg-transparent px-5 ps-12 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app placeholder:text-muted data-[focus-visible=true]:border-accent data-[focus-visible=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)]",
    inputWithSuffix: "pe-12",
    suffixButton:
      "absolute end-1.5 top-1/2 z-10 -translate-y-1/2 text-muted outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    strength: "flex flex-col gap-2",
    strengthBars: "grid grid-cols-4 gap-2",
    strengthBar: "h-1.5 rounded-full bg-white/15",
    strengthBarActive: "bg-accent",
    strengthMessage: "text-sm text-foreground/90",
    otpWrap: "flex w-full justify-center",
    otpGroup: "flex w-full justify-center gap-2 [direction:ltr] sm:gap-3",
    otpSlot:
      "size-12 rounded-2xl border border-border/60 bg-transparent text-xl font-bold text-foreground shadow-none transition-[border-color,box-shadow] duration-fast ease-app data-[active=true]:border-accent data-[active=true]:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)] sm:size-14",
    hint: "text-center text-sm leading-6 text-muted",
    phoneValue:
      "font-bold text-foreground [direction:ltr] [unicode-bidi:isolate]",
    error:
      "rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-center text-sm font-semibold text-danger",
    success: "text-center text-sm leading-6 text-success",
    submit:
      "min-h-14 rounded-full text-base font-bold text-accent-foreground",
    submitIcon: "ms-2 size-5",
    backButton:
      "text-foreground outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
    footerCopy: "flex flex-col items-center gap-1 text-sm",
    footerLink:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    resendRow:
      "flex min-h-10 items-center justify-center gap-2 text-sm text-muted",
    resend:
      "font-semibold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    timer:
      "font-bold text-foreground [direction:ltr] [font-variant-numeric:tabular-nums]",
  },
});

export type ForgotPasswordScreenVariants = VariantProps<
  typeof forgotPasswordScreenVariants
>;
