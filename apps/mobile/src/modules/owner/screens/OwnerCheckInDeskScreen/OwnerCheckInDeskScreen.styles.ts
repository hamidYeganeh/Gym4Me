import { tv } from "tailwind-variants";

export const ownerCheckInDeskScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    form: "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-4",
    feedback: "text-center",
    success: "text-success",
    danger: "text-danger",
    section: "flex flex-col gap-3",
    sectionHeader: "flex items-start justify-between gap-3",
    sectionCopy: "flex min-w-0 flex-col gap-1",
    sectionTitle: "text-foreground",
    sectionHint: "text-muted",
    reviewList: "flex flex-col gap-3",
    reviewCard: "flex flex-col gap-3 rounded-[24px] bg-surface p-4",
    reviewHeader: "flex items-start justify-between gap-3",
    reviewBody: "flex min-w-0 flex-col gap-1",
    reviewCode: "font-mono text-foreground",
    reviewMeta: "text-muted",
    reviewReason: "text-danger",
    reviewActions: "flex flex-wrap justify-end gap-2",
    empty: "rounded-[24px] bg-surface p-4 text-center text-muted",
  },
});
