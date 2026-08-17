export const discoverySportsDetailScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-7 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  heroCard: "w-full max-w-sm self-center",
  section: "flex flex-col gap-3",
  sectionTitle: "text-foreground",
  sectionHint: "text-muted",
  stack: "flex flex-col gap-4",
  clubCard: "w-full",
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
  emptyTitle: "text-foreground",
  emptyBody: "text-muted",
} as const;
