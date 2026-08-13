export const paymentResultScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-6",
  hero: "flex flex-col items-center gap-4 text-center",
  iconCircleSuccess:
    "flex size-24 items-center justify-center rounded-full bg-success/10 text-success",
  iconCircleFailed:
    "flex size-24 items-center justify-center rounded-full bg-danger/10 text-danger",
  heroTitle: "text-foreground",
  heroBody: "text-muted",
  detailsCard:
    "overflow-hidden rounded-[24px] border-0 bg-surface shadow-sm shadow-foreground/5",
  detailRow: "flex items-center justify-between gap-3 px-4 py-3.5",
  detailLabel: "text-muted",
  detailValue: "text-foreground text-end",
  divider: "mx-4 h-px bg-border",
  actions: "flex flex-col gap-3",
} as const;
