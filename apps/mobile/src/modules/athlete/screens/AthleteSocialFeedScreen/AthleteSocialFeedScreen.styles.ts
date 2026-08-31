import { tv } from "tailwind-variants";

export const athleteSocialFeedScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    list: "flex flex-col gap-3",
    card: "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4 text-start",
    cardTop: "flex items-start justify-between gap-2",
    author: "text-foreground",
    meta: "text-muted",
    body: "text-foreground whitespace-pre-wrap",
    media:
      "flex h-36 items-center justify-center rounded-[18px] border border-dashed border-border bg-background text-muted",
    mediaGrid: "grid w-full grid-cols-2 gap-2 overflow-hidden rounded-[18px]",
    mediaImage: "aspect-square w-full bg-background object-cover",
    actions: "flex items-center gap-1",
    empty: "flex flex-col items-center gap-2 border-0 bg-surface text-center",
  },
});
