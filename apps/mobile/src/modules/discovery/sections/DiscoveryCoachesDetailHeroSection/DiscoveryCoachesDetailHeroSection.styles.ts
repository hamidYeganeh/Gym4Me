export const discoveryCoachesDetailHeroSectionStyles = {
  root: "mx-auto flex w-full max-w-lg flex-col gap-4 px-5 pt-2",
  header: [
    "sticky top-0 z-20 -mx-5 flex items-center justify-between gap-3",
    "bg-background/90 px-5 py-2 backdrop-blur-md",
    "pt-[max(0.5rem,env(safe-area-inset-top))]",
  ].join(" "),
  headerTitle: "min-w-0 flex-1 text-center text-foreground",
  identityCard: [
    "flex flex-col gap-3 rounded-[1.75rem] border border-border/70 bg-surface p-5",
  ].join(" "),
  verifiedRow: "flex items-center gap-1.5 text-success",
  verifiedText: "text-sm font-semibold text-success",
  name: "tracking-tight text-foreground",
  specialty: "text-muted",
  metaRow: "flex flex-wrap items-center gap-2 text-muted",
  metaItem: "inline-flex items-center gap-1.5",
  metaDot: "size-1 rounded-full bg-muted",
  ratingStar: "shrink-0 text-accent",
  metaValue: "text-sm text-foreground",
} as const;
