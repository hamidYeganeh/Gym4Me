import { tv } from "tailwind-variants";

export const discoveryHomeEquipmentSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex items-start justify-between gap-3",
    titleRow: "flex min-w-0 flex-1 items-center gap-2",
    accent: "mt-0.5 shrink-0 text-accent",
    title:
      "min-w-0 flex-1 text-[1.35rem] leading-tight tracking-tight text-foreground",
    seeAll:
      "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
    grid: "flex flex-wrap gap-2",
  },
});
