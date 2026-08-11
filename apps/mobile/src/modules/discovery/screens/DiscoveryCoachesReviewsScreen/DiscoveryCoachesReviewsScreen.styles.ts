export const discoveryCoachesReviewsScreenStyles = {
  root: "relative min-h-dvh w-full bg-background",
  header: [
    "sticky top-0 z-20 flex items-center gap-3",
    "bg-linear-to-t from-transparent via-background/80 to-background",
    "px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
  ].join(" "),
  title: "min-w-0 flex-1 text-foreground",
  body: "mx-auto w-full max-w-lg px-4 py-5",
} as const;
