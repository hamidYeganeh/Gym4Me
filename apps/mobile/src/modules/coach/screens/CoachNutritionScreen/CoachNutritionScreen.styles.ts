export const coachNutritionScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  list: "flex flex-col gap-3",
  card: "flex w-full flex-col gap-2 rounded-[24px] border-0 bg-surface p-4 text-start",
  cardTop: "flex items-start justify-between gap-2",
  cardMeta: "text-muted",
  empty: "flex flex-col items-center gap-2 border-0 bg-surface text-center",
} as const;
