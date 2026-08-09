import { tv } from "tailwind-variants";

/** Introduce shell — surface→accent wash + elevated footer sheet (light & dark). */
export const welcomeIntroduceScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    glow: [
      "pointer-events-none absolute inset-0",
      "bg-[linear-gradient(to_bottom,var(--background)_0%,var(--background)_38%,color-mix(in_oklch,var(--accent)_26%,var(--background))_100%)]",
    ],
    content:
      "relative z-10 flex min-h-dvh flex-col pt-[max(1.5rem,env(safe-area-inset-top))]",
    carousel: "relative min-h-0 w-full flex-1 overflow-hidden px-screen",
    track: "flex h-full touch-pan-y",
  },
});
