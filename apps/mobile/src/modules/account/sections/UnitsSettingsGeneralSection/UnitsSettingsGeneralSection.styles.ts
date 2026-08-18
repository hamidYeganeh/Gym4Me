import { tv } from "tailwind-variants";

export const unitsSettingsGeneralSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    title: "px-1 font-semibold text-foreground",
    grid: "grid grid-cols-2 items-stretch gap-3",
  },
});
