import { tv } from "tailwind-variants";

/** Introduce shell — lifted atmosphere so slides aren’t pitch black. */
export const welcomeIntroduceScreenVariants = tv({
  slots: {
    root: [
      "relative flex min-h-dvh flex-col overflow-hidden text-foreground",
      "bg-[color-mix(in_oklch,var(--background)_35%,var(--surface)_65%)]",
    ],
    glow: [
      "pointer-events-none absolute inset-0",
      "bg-[radial-gradient(150%_100%_at_50%_-15%,color-mix(in_oklch,var(--surface)_85%,transparent)_0%,transparent_60%),radial-gradient(125%_75%_at_50%_110%,color-mix(in_oklch,var(--accent)_30%,transparent)_0%,transparent_62%)]",
    ],
    content:
      "relative z-10 flex min-h-dvh flex-col pt-[max(1.5rem,env(safe-area-inset-top))]",
    carousel: "relative min-h-0 w-full flex-1 overflow-hidden px-screen",
    track: "flex h-full touch-pan-y",
  },
});
