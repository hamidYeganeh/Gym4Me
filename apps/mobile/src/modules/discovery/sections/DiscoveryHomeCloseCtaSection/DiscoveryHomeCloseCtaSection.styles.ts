import { tv } from "tailwind-variants";

export const discoveryHomeCloseCtaSectionVariants = tv({
  slots: {
    root: "relative",
    stroke: [
      "pointer-events-none absolute -start-2 top-3 h-16 w-1 rotate-12 rounded-full",
      "bg-accent",
    ].join(" "),
    card: "relative",
  },
});
