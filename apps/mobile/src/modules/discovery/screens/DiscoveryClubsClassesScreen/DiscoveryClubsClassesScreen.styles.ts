export const discoveryClubsClassesScreenStyles = {
  root: "relative min-h-dvh w-full bg-background",
  header: [
    "sticky top-0 z-20 flex items-center gap-3",
    "border-b border-border/50 bg-background/95 px-4 py-3 backdrop-blur-xl",
    "pt-[max(0.75rem,env(safe-area-inset-top))]",
  ].join(" "),
  title: "min-w-0 flex-1 text-foreground",
  list: "mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-5",
  empty: "px-4 py-10 text-center text-muted",
} as const;
