import { tv } from "tailwind-variants";

export const discoveryHomeQuickNavSectionVariants = tv({
  slots: {
    root: "grid grid-cols-2 gap-3",
    wide: "col-span-2",
    map: [
      "bg-accent text-accent-foreground",
      "hover:bg-accent/90 data-[hovered=true]:bg-accent/90",
    ].join(" "),
    mapTile: "bg-accent-foreground/15 text-accent-foreground",
    mapLabel: "text-accent-foreground",
  },
});
