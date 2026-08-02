export const discoveryClubsClassDetailActionsSectionStyles = {
  root: [
    "fixed inset-x-0 bottom-0 z-30",
    "border-t border-border/50 bg-surface/95 px-4 pt-3 backdrop-blur-xl",
    "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
  ].join(" "),
  stack: "mx-auto flex w-full max-w-lg flex-col gap-2.5",
  primary: [
    "h-12 w-full gap-2 rounded-2xl border-0 font-semibold",
    "bg-stats-orange text-stats-foreground",
    "hover:bg-stats-orange/90 pressed:bg-stats-orange/85",
  ].join(" "),
  secondary: [
    "h-12 w-full gap-2 rounded-2xl border-2 border-stats-orange",
    "bg-transparent font-semibold text-stats-orange shadow-none",
    "hover:bg-stats-orange/8 pressed:bg-stats-orange/12",
  ].join(" "),
} as const;
