import { tv } from "tailwind-variants";

export const gym4MeScoreCardVariants = tv({
  slots: {
    root: "relative block w-full min-w-0 select-none",
    /** Figma artboard includes soft drop shadow padding around the card. */
    image: "pointer-events-none h-auto w-full",
  },
});
