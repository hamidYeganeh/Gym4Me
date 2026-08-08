export const athleteWalletScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  balanceCard: "w-full",
  statsGrid: "grid grid-cols-2 gap-3",
  sectionTitle: "px-1 text-muted",
  section: "flex flex-col gap-2",
  trendCard: "rounded-[24px] border border-border bg-surface p-4",
  groups: "flex flex-col gap-5",
  group: "flex flex-col gap-2",
  groupTitle: "px-1 text-muted",
  groupCard:
    "overflow-hidden rounded-[24px] border border-border bg-surface",
  row: "flex items-center gap-3 px-4 py-3.5",
  rowIconCredit:
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success",
  rowIconDebit:
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger",
  rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
  rowTitle: "text-foreground",
  rowMeta: "text-muted",
  rowAmountCredit: "shrink-0 text-end text-success",
  rowAmountDebit: "shrink-0 text-end text-foreground",
  divider: "mx-4 h-px bg-border",
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border border-border bg-surface px-6 py-10 text-center",
  emptyBody: "text-muted",
} as const;
