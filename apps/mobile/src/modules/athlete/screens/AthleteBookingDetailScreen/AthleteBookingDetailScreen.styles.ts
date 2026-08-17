export const athleteBookingDetailScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  hero: "flex flex-col items-center gap-3 rounded-[24px] border-0 bg-surface px-6 py-8 text-center",
  heroTitle: "text-foreground",
  heroClub: "text-muted",
  sectionTitle: "px-1 text-muted",
  section: "flex flex-col gap-2",
  timelineCard:
    "flex flex-col rounded-[24px] border-0 bg-surface p-5",
  timelineStep: "flex gap-3",
  timelineMarkers: "flex flex-col items-center",
  timelineDot:
    "flex size-7 shrink-0 items-center justify-center rounded-full border",
  timelineDotDone: "border-success bg-success text-success-foreground",
  timelineDotCurrent: "border-accent bg-accent/10 text-accent",
  timelineDotPending: "border-border bg-default text-muted",
  timelineLine: "min-h-6 w-px flex-1",
  timelineLineDone: "bg-success",
  timelineLinePending: "bg-border",
  timelineBody: "flex flex-col pb-5 pt-0.5",
  timelineLabelDone: "text-foreground",
  timelineLabelCurrent: "text-accent",
  timelineLabelPending: "text-muted",
  detailsCard:
    "overflow-hidden rounded-[24px] border-0 bg-surface",
  detailRow: "flex items-center justify-between gap-3 px-4 py-3.5",
  detailLabel: "text-muted",
  detailValue: "text-foreground text-end",
  divider: "mx-4 h-px bg-border",
  checkInCard:
    "flex flex-col items-center gap-3 rounded-[24px] border border-accent/30 bg-accent/10 px-6 py-7 text-center",
  checkInTitle: "text-foreground",
  checkInCode:
    "text-4xl font-bold tracking-[0.4em] text-accent [direction:ltr]",
  checkInHint: "text-muted",
  actions: "flex flex-col gap-3",
  cancelConfirm:
    "flex flex-col gap-3 rounded-[24px] border border-danger/30 bg-danger/10 p-5",
  cancelConfirmTitle: "text-foreground",
  cancelConfirmBody: "text-muted",
  cancelConfirmActions: "flex gap-3",
  cancelReasons: "flex flex-col gap-2",
  cancelReason:
    "flex w-full items-center gap-3 rounded-[1.25rem] border-0 bg-surface px-4 py-3 text-start transition-colors",
  cancelReasonSelected: "border-danger bg-danger/5",
  cancelReasonRadio:
    "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border",
  cancelReasonRadioSelected: "border-danger",
  cancelReasonDot: "size-2.5 rounded-full bg-danger",
  cancelReasonLabel: "text-foreground",
  errorText: "text-danger",
  cancelledNotice:
    "rounded-[24px] border-0 bg-surface px-5 py-4 text-center",
  cancelledNoticeText: "text-muted",
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
  emptyTitle: "text-foreground",
} as const;
