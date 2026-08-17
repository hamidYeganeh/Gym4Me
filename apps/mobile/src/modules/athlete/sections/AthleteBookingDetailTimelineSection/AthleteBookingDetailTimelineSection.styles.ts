import { tv } from "tailwind-variants";

export const athleteBookingDetailTimelineSectionVariants = tv({
  slots: {
    section: "flex flex-col gap-2",
    sectionTitle: "px-1 text-muted",
    timelineCard: "flex flex-col rounded-[24px] border-0 bg-surface p-5",
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
  },
});
