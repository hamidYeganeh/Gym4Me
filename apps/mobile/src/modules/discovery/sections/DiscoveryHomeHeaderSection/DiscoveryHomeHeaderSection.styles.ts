import { tv } from "tailwind-variants";

export const discoveryHomeHeaderSectionVariants = tv({
  slots: {
    spacer:
      "pointer-events-none shrink-0 h-[calc(72px+env(safe-area-inset-top))]",
    header: [
      "fixed top-0 left-1/2 z-40 w-full max-w-xl -translate-x-1/2",
      "overflow-hidden rounded-b-[2.5rem] bg-surface-secondary backdrop-blur-md",
      "pt-[env(safe-area-inset-top)]",
    ].join(" "),
    bar: "relative flex h-[72px] min-h-[72px] items-center justify-center px-screen",
    filterButton: [
      "absolute start-screen top-1/2 z-10 -translate-y-1/2",
      "rounded-[0.875rem] text-foreground",
    ].join(" "),
    locationChip: [
      "h-9 gap-1.5 rounded-full bg-surface px-3.5",
      "text-default-foreground shadow-none",
      "hover:bg-default/80 data-[hovered=true]:bg-default/80",
    ].join(" "),
    locationLabel: "max-w-[12rem] truncate text-sm font-medium",
  },
});
