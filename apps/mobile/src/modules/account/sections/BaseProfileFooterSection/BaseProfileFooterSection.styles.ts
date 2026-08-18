import { tv } from "tailwind-variants";

export const baseProfileFooterSectionVariants = tv({
  slots: {
    root: "flex flex-col items-center gap-5 pt-2",
    signOut: "h-auto min-h-0 gap-2 px-0 py-0 font-semibold text-danger",
    brand: "flex flex-col items-center gap-1.5",
    version: "text-accent",
    copyright: "text-muted",
  },
});
