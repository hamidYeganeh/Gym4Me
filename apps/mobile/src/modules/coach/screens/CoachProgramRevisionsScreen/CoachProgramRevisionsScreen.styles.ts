export const coachProgramRevisionsScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  list: "flex flex-col gap-3",
  revisionCard:
    "flex flex-col gap-2 rounded-[24px] border-0 bg-surface p-4",
  revisionSelected: "ring-2 ring-accent",
  revisionMeta: "text-muted",
  diffCard: "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4",
  diffSection: "flex flex-col gap-1",
  addedLine: "text-success",
  removedLine: "text-danger line-through",
  empty: "text-center text-muted",
} as const;
