export const coachEarningsScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  balanceCard:
    "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-7 text-center shadow-sm shadow-foreground/5",
  balanceLabel: "text-muted",
  balanceRow: "flex items-baseline gap-2",
  balanceValue: "tracking-tight text-foreground",
  balanceUnit: "text-muted",
  balanceHint: "text-muted",
  statsGrid: "grid grid-cols-2 gap-4",
  section: "flex flex-col gap-3",
  sectionTitle: "text-foreground",
  chartCard:
    "rounded-[24px] border-0 bg-surface p-4 shadow-sm shadow-foreground/5",
  groupCard:
    "overflow-hidden rounded-[24px] border-0 bg-surface shadow-sm shadow-foreground/5",
  row: "flex items-center justify-between gap-3 px-4 py-3.5",
  rowLabel: "text-foreground",
  rowLabelMuted: "text-muted",
  rowAmount: "shrink-0 text-foreground",
  rowAmountDeduction: "shrink-0 text-danger",
  rowAmountNet: "shrink-0 text-success",
  rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
  divider: "mx-4 h-px bg-border last:hidden",
} as const;
