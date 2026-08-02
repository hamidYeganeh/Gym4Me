export const discoveryClubsClassDetailHeroSectionHeaderStyles = {
  root: [
    "absolute inset-x-0 top-0 z-20",
    "flex items-center justify-between gap-3 px-4",
    "pt-[max(0.875rem,env(safe-area-inset-top))]",
  ].join(" "),
  title:
    "min-w-0 flex-1 truncate text-center text-base font-semibold text-stats-foreground drop-shadow-sm",
  iconButton: [
    "border-0 bg-overlay/70 text-overlay-foreground shadow-none backdrop-blur-md",
    "hover:bg-overlay/85 pressed:bg-overlay",
  ].join(" "),
} as const;
