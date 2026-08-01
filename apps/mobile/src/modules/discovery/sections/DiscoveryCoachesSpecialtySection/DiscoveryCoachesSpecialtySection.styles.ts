export const discoveryCoachesSpecialtySectionStyles = {
  root: "flex flex-col gap-3",
  header: "flex items-center justify-between gap-3 px-screen",
  title: "text-foreground",
  seeAll:
    "cursor-pointer text-sm font-semibold text-warning no-underline shadow-none",
  scroller:
    "flex gap-2.5 overflow-x-auto px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  chip: [
    "h-10 shrink-0 gap-1.5 rounded-full border border-border bg-surface px-3.5",
    "text-sm font-medium text-foreground shadow-none",
    "hover:bg-surface-secondary data-[hovered=true]:bg-surface-secondary",
    "data-[pressed=true]:scale-[0.98]",
    "[--button-bg:var(--surface)] [--button-fg:var(--foreground)]",
    "[--button-bg-hover:var(--surface-secondary)] [--button-bg-pressed:var(--surface-secondary)]",
  ].join(" "),
  chipIcon: "size-4 shrink-0 text-muted",
} as const;
