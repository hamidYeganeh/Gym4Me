import { tv } from "tailwind-variants";

export const kycStatusOutcomeSectionVariants = tv({
  slots: {
    root:
      "relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    panel:
      "mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2.25rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-8",
    body:
      "flex flex-1 flex-col items-center justify-center gap-5 text-center",
    icon: "text-success",
    title:
      "max-w-[18ch] text-balance text-[1.65rem] font-bold tracking-tight text-foreground",
    subtitle:
      "max-w-xs text-pretty text-[0.95rem] leading-relaxed text-muted",
    actions: "flex w-full flex-col items-center gap-4 pb-2",
    primary: "w-full text-base font-bold text-accent-foreground",
    primaryIcon: "ms-2",
  },
});
