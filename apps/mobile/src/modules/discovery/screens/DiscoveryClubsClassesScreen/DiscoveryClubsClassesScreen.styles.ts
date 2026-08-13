export const discoveryClubsClassesScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  meta: "text-muted",
  list: "flex flex-col gap-4",
  card: "w-full",
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center shadow-sm shadow-foreground/5",
  emptyTitle: "text-foreground",
  emptyBody: "text-muted",
} as const;
