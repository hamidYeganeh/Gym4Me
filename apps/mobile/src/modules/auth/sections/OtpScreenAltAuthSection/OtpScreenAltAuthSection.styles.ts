import { tv } from "tailwind-variants";

export const otpScreenAltAuthSectionVariants = tv({
  slots: {
    root: "flex w-full flex-col items-stretch gap-5",
    divider: "flex w-full items-center gap-3",
    dividerLine: "h-px flex-1 bg-separator",
    dividerLabel:
      "shrink-0 text-xs font-medium tracking-wide text-muted sm:text-sm",
    button: "w-full justify-center gap-3",
    icon: "size-5 shrink-0",
  },
});
