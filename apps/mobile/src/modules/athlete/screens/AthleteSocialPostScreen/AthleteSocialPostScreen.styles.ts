import { tv } from "tailwind-variants";

export const athleteSocialPostScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    author: "text-foreground",
    meta: "text-muted",
    body: "text-foreground whitespace-pre-wrap",
    media:
      "flex h-40 items-center justify-center rounded-[18px] border border-dashed border-border bg-surface text-muted",
    actions: "flex items-center gap-1",
    sectionTitle: "text-muted",
    list: "flex flex-col gap-3",
    commentCard:
      "flex flex-col gap-1 rounded-[20px] border-0 bg-surface p-4 shadow-sm shadow-foreground/5",
    compose:
      "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4 shadow-sm shadow-foreground/5",
    empty:
      "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-8 text-center shadow-sm shadow-foreground/5",
  },
});
