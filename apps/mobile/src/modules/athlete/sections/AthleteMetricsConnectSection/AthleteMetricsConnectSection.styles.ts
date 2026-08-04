export const athleteMetricsConnectSectionStyles = {
  root: "w-full px-4",
  card: "flex items-center gap-3 rounded-2xl border border-border/70 bg-default px-4 py-3.5",
  iconWrap:
    "flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent",
  content: "flex min-w-0 flex-1 flex-col gap-0.5",
  title: "text-foreground",
  subtitle: "text-muted",
  actions: "flex shrink-0 flex-col items-end gap-2",
  statusChip: "max-w-[7.5rem]",
} as const;
