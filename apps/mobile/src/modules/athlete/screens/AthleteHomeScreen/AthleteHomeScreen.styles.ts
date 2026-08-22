export const athleteHomeScreenStyles = {
  root: "bg-background",
  content: "flex flex-1 flex-col gap-9 pb-32 pt-3",
  section: "flex flex-col gap-4",
  metricsGrid: "flex flex-col gap-3",
  quickGrid: "screen-grid grid-cols-3 gap-y-5",
  moreGlyph:
    "flex h-8 items-center justify-center gap-1 rounded-full bg-muted px-3.5",
  moreDot: "size-1.5 rounded-full bg-foreground",
} as const;
