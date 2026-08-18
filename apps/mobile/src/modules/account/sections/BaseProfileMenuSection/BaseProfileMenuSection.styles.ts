import { tv } from "tailwind-variants";

export const baseProfileMenuSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-6",
    group: "flex flex-col gap-2",
    groupTitle: "px-1 text-muted",
    stack: "flex flex-col gap-2",
  },
});
