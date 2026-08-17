import { tv } from "tailwind-variants";

export const otpScreenAltAuthSectionVariants = tv({
  slots: {
    root: "flex w-full flex-col items-stretch gap-5",
    divider: "flex w-full items-center gap-3",
    dividerLine: "h-px flex-1 bg-separator",
    dividerLabel:
      "shrink-0 text-xs font-medium tracking-wide text-muted sm:text-sm",
    button:
      "min-h-14 w-full justify-center gap-3 rounded-2xl border border-border/80 bg-surface/90 text-base font-semibold text-foreground backdrop-blur-sm data-[hovered=true]:bg-surface-secondary data-[pressed=true]:opacity-80 dark:border-border dark:bg-surface/80",
    icon: "size-5 shrink-0 text-accent",
  },
});
