export const coachClientDetailScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  hero: "flex flex-col items-center gap-3 text-center",
  heroAvatar: "size-24 rounded-full object-cover",
  heroName: "tracking-tight text-foreground",
  heroMeta: "text-muted",
  heroChips: "flex items-center gap-2",
  section: "flex flex-col gap-3",
  sectionTitle: "text-foreground",
  chartCard:
    "rounded-[24px] border-0 bg-surface p-4",
  statsGrid: "grid grid-cols-2 gap-4",
  groupCard:
    "overflow-hidden rounded-[24px] border-0 bg-surface",
  row: "flex items-center justify-between gap-3 px-4 py-3.5",
  rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
  rowTitle: "truncate text-foreground",
  rowMeta: "text-muted",
  divider: "mx-4 h-px bg-border last:hidden",
  noteCard:
    "rounded-[24px] border-0 bg-surface px-4 py-4",
  noteBody: "leading-7 text-muted",
  actions: "flex flex-col gap-3",
  emptyRow: "px-4 py-6 text-center text-muted",
} as const;
