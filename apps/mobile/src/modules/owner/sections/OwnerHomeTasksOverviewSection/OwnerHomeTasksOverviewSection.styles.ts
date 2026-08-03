export const ownerHomeTasksOverviewSectionStyles = {
  root: "flex w-full flex-col gap-4",
  header: "flex flex-col gap-2",
  title: "text-foreground",
  summaryRow: "flex items-center justify-between gap-3",
  summary: "flex min-w-0 items-center gap-2 text-muted",
  summaryIcon: "shrink-0 text-foreground",
  summaryText: "min-w-0 text-sm text-muted",
  seeAll:
    "shrink-0 cursor-pointer text-sm font-semibold text-stats-blue no-underline shadow-none",
  grid: "grid w-full grid-cols-2 gap-3",
  primaryCard:
    "relative col-span-2 overflow-hidden rounded-[28px] border-0 bg-stats-blue p-5 text-stats-foreground shadow-none",
  primaryDecor: "pointer-events-none absolute inset-y-4 end-4 flex gap-2",
  primaryBar:
    "h-full w-3 rounded-full bg-stats-foreground/15 first:opacity-100 [&:nth-child(2)]:opacity-70 last:opacity-40",
  primaryHeader: "relative z-10 flex items-start justify-between gap-3",
  primaryLabel: "text-stats-foreground/95",
  primaryAction:
    "size-9 shrink-0 rounded-full bg-accent text-accent-foreground shadow-none",
  primaryBody: "relative z-10 mt-6 flex flex-col gap-2",
  primaryValue: "text-5xl font-bold tracking-tight text-stats-foreground",
  primaryDescription: "max-w-[18rem] text-sm text-stats-foreground/85",
  secondaryCard:
    "flex min-h-[168px] flex-col justify-between overflow-hidden rounded-[28px] border-0 p-4 shadow-none",
  upcomingCard:
    "bg-[color-mix(in_oklab,var(--accent)_42%,var(--surface))] text-foreground",
  assignedCard: "border border-border bg-surface text-foreground",
  cardHeader: "flex items-start justify-between gap-2",
  cardLabel: "text-sm font-medium text-foreground",
  cardAction:
    "size-8 shrink-0 rounded-full bg-foreground text-background shadow-none",
  cardBody: "flex flex-col gap-1.5",
  cardValue: "text-4xl font-bold tracking-tight text-foreground",
  cardDescription: "text-xs text-foreground/75",
} as const;
