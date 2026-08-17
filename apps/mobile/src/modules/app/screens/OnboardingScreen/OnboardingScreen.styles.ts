import { tv } from "tailwind-variants";

export const onboardingScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    content:
      "relative z-10 flex min-h-dvh flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]",
    header: "shrink-0",
  },
});
