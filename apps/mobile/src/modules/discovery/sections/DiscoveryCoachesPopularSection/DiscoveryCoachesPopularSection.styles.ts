export const discoveryCoachesPopularSectionStyles = {
  root: "flex flex-col gap-3 px-screen",
  header: "flex items-start justify-between gap-3",
  titleBlock: "min-w-0 flex-1",
  title: "text-foreground",
  hint: "text-muted",
  seeAll:
    "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
  list: "overflow-hidden rounded-[24px] border border-border bg-surface",
  divider: "mx-4 h-px bg-border last:hidden",
} as const;
