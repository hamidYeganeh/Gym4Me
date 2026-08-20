import { tv } from "tailwind-variants";

/** Matches native splash.png: solid accent, mark centered, Roboto brand below. */
export const splashScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh items-center justify-center overflow-hidden bg-accent px-screen text-foreground",
    /** In-flow mark only — keeps the logo at the viewport center (like splash.png). */
    markAnchor: "relative z-10 flex items-center justify-center",
    /** Anchored under the mark so brand never shifts the logo. */
    copy: "absolute inset-x-0 top-full mt-5 flex flex-col items-center text-center",
    brand:
      "font-roboto flex items-center justify-center text-5xl font-bold tracking-normal text-foreground sm:text-6xl",
  },
});
