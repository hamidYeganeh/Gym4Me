import { tv } from "tailwind-variants";

/** Introduce shell — dark charcoal + orange floor glow (Sandow welcome). */
export const welcomeIntroduceScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground dark:bg-black",
    glow: [
      "pointer-events-none absolute inset-0",
      "bg-[linear-gradient(to_bottom,var(--background)_0%,var(--background)_42%,color-mix(in_oklch,var(--accent)_22%,var(--background))_100%)]",
      "dark:bg-[radial-gradient(120%_55%_at_50%_100%,color-mix(in_srgb,var(--stats-orange)_42%,transparent)_0%,transparent_58%),linear-gradient(to_bottom,#000_0%,#000_48%,#0a0a0a_100%)]",
    ],
    content:
      "relative z-10 flex min-h-dvh flex-col pt-[max(1.5rem,env(safe-area-inset-top))]",
    carousel: "relative min-h-0 w-full flex-1 overflow-hidden px-4",
    track: "flex h-full touch-pan-y",
  },
});
