export const discoveryArticlesScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-12 pt-1",
  intro: "relative flex flex-col gap-2 ps-4",
  introAccent:
    "pointer-events-none absolute inset-y-1 start-0 w-1 rounded-full bg-accent",
  introSubtitle: "max-w-[22rem] text-pretty leading-relaxed text-muted",
  meta: "text-muted",
  list: "flex flex-col gap-4",
  empty: "flex flex-col items-center gap-2 border-0 bg-surface text-center",
  sentinel: "flex min-h-12 items-center justify-center py-4",
} as const;
