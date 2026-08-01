export const discoveryClubsClassDetailHeroSectionHeaderStyles = {
  root: [
    "absolute inset-x-0 top-0 z-20",
    "flex items-center justify-between gap-3 px-4",
    "pt-[max(0.875rem,env(safe-area-inset-top))]",
  ].join(" "),
  title:
    "min-w-0 flex-1 truncate text-center text-base font-semibold text-white drop-shadow-sm",
  iconButton: [
    "border-0 bg-black/25 text-white shadow-none backdrop-blur-md",
    "hover:bg-black/35 pressed:bg-black/40",
  ].join(" "),
} as const;
