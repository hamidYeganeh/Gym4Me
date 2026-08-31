import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const otpScreenVariants = tv({
  slots: {
    altBlock: "flex w-full flex-col items-stretch gap-5",
    divider: "flex w-full items-center gap-3",
    dividerLine: "h-px flex-1 bg-separator",
    dividerLabel:
      "shrink-0 text-xs font-medium tracking-wide text-muted sm:text-sm",
    altButton: "w-full justify-center gap-3 border border-border/80 bg-surface/90 text-base font-semibold text-foreground backdrop-blur-sm data-[hovered=true]:bg-surface-secondary data-[pressed=true]:opacity-80 dark:border-border dark:bg-surface/80",
    altIcon: "size-5 shrink-0 text-accent",
    footer: "text-sm text-muted sm:text-base",
    footerLink:
      "inline-flex items-center gap-2 font-bold text-accent underline underline-offset-4 outline-none data-[hovered=true]:opacity-80",
    backButton: "outline-none",
    figureImage:
      "h-auto w-full max-w-[11.5rem] object-contain sm:max-w-[13rem]",
  },
});

export type OtpScreenVariants = VariantProps<typeof otpScreenVariants>;
