export const ownerStaffScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  inviteRow: "flex",
  list: "flex flex-col gap-4",
  staffCard:
    "h-auto w-full items-stretch justify-start gap-0 rounded-[24px] border border-border bg-surface p-4 text-start font-normal",
  staffBody: "flex w-full flex-col gap-3",
  staffTop: "flex items-center gap-3",
  avatar:
    "size-11 shrink-0 overflow-hidden rounded-full bg-default object-cover",
  staffHeading: "flex min-w-0 flex-1 flex-col gap-0.5",
  staffName: "truncate text-foreground",
  staffMeta: "truncate text-muted",
  grants: "flex flex-wrap items-center gap-2",
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border border-border bg-surface px-6 py-10 text-center",
  emptyTitle: "text-foreground",
  emptyBody: "text-muted",
} as const;
