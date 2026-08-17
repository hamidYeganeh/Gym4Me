export const notificationsScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-7 pb-12 pt-2",
  intro: "flex flex-col gap-2",
  introTitle: "text-balance tracking-tight text-foreground",
  introSubtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
  groups: "flex flex-col gap-5",
  group: "flex flex-col gap-2",
  groupTitle: "px-1 text-muted",
  groupList: "flex flex-col gap-3",
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
  emptyTitle: "text-foreground",
  emptyBody: "text-muted",
} as const;
