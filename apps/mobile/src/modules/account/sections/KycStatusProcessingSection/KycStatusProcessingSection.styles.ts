import { tv } from "tailwind-variants";

export const kycStatusProcessingSectionVariants = tv({
  slots: {
    root:
      "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6",
    steps: "flex flex-col items-center gap-3 text-center",
    step: "text-base font-semibold transition-colors duration-300",
    stepActive: "text-foreground",
    stepIdle: "text-muted",
    glow:
      "pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[radial-gradient(60%_80%_at_50%_100%,color-mix(in_oklch,var(--accent)_45%,transparent),transparent_70%)]",
    mark:
      "relative z-10 mb-[max(3rem,env(safe-area-inset-bottom))] mt-auto text-accent",
  },
});
