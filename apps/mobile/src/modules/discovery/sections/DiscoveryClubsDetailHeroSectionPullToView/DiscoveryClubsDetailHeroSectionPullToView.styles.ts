export const discoveryClubsDetailHeroSectionPullToViewStyles = {
  banner:
    "pointer-events-none fixed inset-x-0 top-0 z-20 flex h-20 items-center justify-center gap-2 bg-accent text-accent-foreground shadow-sm",
  icon: "transition-transform duration-fast ease-app",
  iconReady: "text-accent",
  iconIdle: "text-muted",
  labelReady: "text-accent-foreground",
  labelIdle: "text-accent-foreground/50",
  surface: "relative w-full touch-none select-none",
} as const;
