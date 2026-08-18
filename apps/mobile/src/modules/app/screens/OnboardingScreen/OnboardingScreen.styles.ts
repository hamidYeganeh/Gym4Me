import { tv } from "tailwind-variants";

export const onboardingScreenVariants = tv({
  slots: {
    root: "relative flex h-dvh min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    overlay: "pointer-events-none relative z-10 flex min-h-dvh flex-col",
    header:
      "pointer-events-auto shrink-0 px-5 pt-[max(0.75rem,env(safe-area-inset-top))]",
    overlayFill: "min-h-0 flex-1",
    footer:
      "pointer-events-auto shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
  },
});
