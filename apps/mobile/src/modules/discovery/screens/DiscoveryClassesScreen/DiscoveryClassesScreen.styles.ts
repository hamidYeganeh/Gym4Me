export const discoveryClassesScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-12 pt-1",
  intro: "relative flex flex-col gap-2 ps-4",
  introAccent:
    "pointer-events-none absolute inset-y-1 start-0 w-1 rounded-full bg-accent",
  introTitle:
    "text-balance text-[2rem] leading-tight tracking-tight text-foreground",
  introSubtitle: "max-w-[22rem] text-pretty leading-relaxed text-muted",
  meta: "text-muted",
  list: "flex flex-col gap-4",
  card: "w-full",
  empty: "flex flex-col items-center gap-2 border-0 bg-surface text-center",
  emptyTitle: "text-foreground",
  emptyBody: "text-muted",
} as const;
