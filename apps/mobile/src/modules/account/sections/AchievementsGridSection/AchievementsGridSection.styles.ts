import { tv } from "tailwind-variants";

export const achievementsGridSectionVariants = tv({
  slots: {
    section: "flex flex-col gap-3",
    sectionTitle: "px-1 text-muted",
    grid: "grid grid-cols-3 gap-3",
    gridItem:
      "flex flex-col items-center gap-2 rounded-[20px] border-0 bg-surface p-3 text-center",
    gridItemLocked: "opacity-45",
    gridItemTitle: "line-clamp-2 text-xs font-medium text-foreground",
    gridItemMeta: "text-[11px] tabular-nums text-muted",
  },
});
