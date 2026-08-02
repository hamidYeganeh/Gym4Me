export const discoveryCoachesPopularSectionStyles = {
  root: "flex flex-col gap-3 px-screen",
  header: "flex items-center justify-between gap-3",
  title: "text-foreground",
  seeAll:
    "cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
  list: "overflow-hidden rounded-[24px] border border-border bg-surface",
  divider: "mx-4 h-px bg-border last:hidden",
} as const;
