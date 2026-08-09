export const discoveryClubsReviewsScreenStyles = {
  root: "relative min-h-dvh w-full bg-background",
  header: [
    "sticky top-0 z-20 flex items-center gap-3",
    "bg-linear-to-t from-transparent via-background/80 to-background",
    "px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
  ].join(" "),
  title: "min-w-0 flex-1 text-foreground",
  list: "mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-5",
  reviewCard: "border border-border/70 bg-default",
  empty: "px-4 py-10 text-center text-muted",
} as const;
