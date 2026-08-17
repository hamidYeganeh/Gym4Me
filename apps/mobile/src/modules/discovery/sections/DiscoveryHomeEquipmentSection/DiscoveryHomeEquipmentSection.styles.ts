import { tv } from "tailwind-variants";

export const discoveryHomeEquipmentSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex items-start justify-between gap-3",
    titleRow: "flex min-w-0 flex-1 items-start gap-3",
    accent: "mt-1.5 h-8 w-1 shrink-0 rounded-full bg-accent",
    title:
      "min-w-0 flex-1 text-[1.35rem] leading-tight tracking-tight text-foreground",
    seeAll:
      "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
    grid: "flex flex-wrap gap-2",
  },
});
