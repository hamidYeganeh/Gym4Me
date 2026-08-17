export const discoverySportsScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-12 pt-1",
  intro: "relative flex flex-col gap-2 ps-4",
  introAccent:
    "pointer-events-none absolute inset-y-1 start-0 w-1 rounded-full bg-accent",
  introTitle:
    "text-balance text-[2rem] leading-tight tracking-tight text-foreground",
  introSubtitle: "max-w-[22rem] text-pretty leading-relaxed text-muted",
  meta: "text-muted",
  grid: "mx-auto grid w-full max-w-lg grid-cols-2 gap-2",
  card: "!h-[14rem] !w-full !rounded-[1.35rem]",
  cardFeatured: "!h-[14rem] !w-full !rounded-[1.35rem] col-span-2",
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
  emptyTitle: "text-foreground",
  emptyBody: "text-muted",
} as const;
