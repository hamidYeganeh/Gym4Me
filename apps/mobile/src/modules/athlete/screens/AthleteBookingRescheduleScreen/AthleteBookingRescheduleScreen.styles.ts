export const athleteBookingRescheduleScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  intro: "flex flex-col gap-1.5",
  introTitle: "text-foreground",
  introSubtitle: "text-muted",
  currentCard:
    "flex flex-col gap-1 rounded-[24px] border-0 bg-surface px-5 py-4",
  currentLabel: "text-muted",
  currentValue: "text-foreground",
  weekRow: "flex items-center justify-between gap-3",
  weekLabel: "text-foreground",
  weekNav: "flex items-center gap-2",
  weekButton: "min-w-10 bg-default",
  weekButtonIcon: "text-foreground",
  emptySlots:
    "flex min-h-32 items-center justify-center rounded-[24px] border border-dashed border-border text-muted",
  errorText: "text-danger",
  loading: "flex min-h-[50vh] items-center justify-center",
  footer: "flex items-center gap-3",
  summary: "flex-1 text-muted",
  confirm: "shrink-0",
} as const;
