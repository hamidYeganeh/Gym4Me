export const discoveryClubsDetailHeroSectionPullToViewStyles = {
  banner: [
    "pointer-events-none fixed inset-x-0 top-0 z-20",
    "flex items-center justify-center gap-2",
    "bg-accent pt-[env(safe-area-inset-top)] text-accent-foreground shadow-sm",
    "h-[calc(5rem+env(safe-area-inset-top))]",
  ].join(" "),
  icon: "transition-transform duration-fast ease-app",
  iconReady: "text-accent",
  iconIdle: "text-muted",
  labelReady: "text-accent-foreground",
  labelIdle: "text-accent-foreground/50",
  surface: "relative w-full touch-none select-none",
} as const;
