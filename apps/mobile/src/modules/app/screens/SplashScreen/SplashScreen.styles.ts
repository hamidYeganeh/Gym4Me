import { tv } from "tailwind-variants";

/** Matches native splash.png: solid accent, mark truly centered, copy below. */
export const splashScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh items-center justify-center overflow-hidden bg-accent px-screen text-foreground",
    /** In-flow mark only — keeps the logo at the viewport center (like splash.png). */
    markAnchor: "relative z-10 flex items-center justify-center",
    /** Anchored under the mark so brand/tagline never shift the logo. */
    copy: "absolute inset-x-0 top-full mt-5 flex flex-col items-center gap-2 text-center",
    brand:
      "font-satisfy flex items-center justify-center text-5xl font-normal tracking-normal text-foreground sm:text-6xl",
    tagline: "min-h-[1.75em] text-lg font-medium text-foreground sm:text-xl",
  },
});
