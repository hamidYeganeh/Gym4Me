import { tv } from "tailwind-variants";

export const onboardingScreenVariants = tv({
  slots: {
    root: "relative flex h-dvh min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    overlay: "pointer-events-none relative z-10 flex min-h-dvh flex-col",
    header:
      "pointer-events-auto shrink-0 px-5 pt-[max(0.75rem,env(safe-area-inset-top))]",
    overlayFill: "min-h-0 flex-1",
    footer:
      "pointer-events-auto relative shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
    footerScrim: [
      "pointer-events-none absolute -inset-x-5 bottom-0 z-0",
      "h-[min(42vh,22rem)]",
      "bg-[linear-gradient(to_top,var(--background)_0%,color-mix(in_oklch,var(--background)_88%,transparent)_42%,color-mix(in_oklch,var(--background)_35%,transparent)_72%,transparent_100%)]",
    ],
    footerActions: "relative z-10",
  },
});
