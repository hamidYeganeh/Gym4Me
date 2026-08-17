import { tv } from "tailwind-variants";

export const athleteHealthAssessmentScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    statusRow: "flex items-center gap-2",
    list: "flex flex-col gap-3",
    card: "flex flex-col gap-3 rounded-[1.25rem] border-0 bg-surface p-4",
    question: "text-foreground",
    answerRow: "flex flex-wrap gap-2",
    meta: "text-muted",
    feedback: "text-success",
    error: "text-danger",
  },
});
