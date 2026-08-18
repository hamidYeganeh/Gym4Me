import { tv } from "tailwind-variants";

/** Introduce shell — Embla image carousel + action sheet overlay. */
export const welcomeIntroduceScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    header: "pointer-events-none absolute inset-x-0 top-0 z-10",
    headerFade: "pointer-events-none absolute inset-x-0 top-0 h-44",
    headerBlur: "pointer-events-none absolute inset-0",
    headerWash: [
      "absolute inset-0",
      "bg-[linear-gradient(to_bottom,var(--background)_0%,color-mix(in_oklch,var(--background)_78%,transparent)_48%,transparent_100%)]",
    ],
    brand: [
      "relative z-10 flex justify-center",
      "pt-[max(1.25rem,env(safe-area-inset-top))] pb-10",
    ],
    content:
      "pointer-events-none relative z-10 flex min-h-dvh flex-col justify-end",
    footerHost: "pointer-events-auto",
  },
});
