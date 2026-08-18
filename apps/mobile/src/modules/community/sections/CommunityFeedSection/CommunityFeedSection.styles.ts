import { tv } from "tailwind-variants";

export const communityFeedSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    loading: "flex justify-center py-10",
    empty: "flex flex-col items-center gap-3 px-2 py-8 text-center",
    list: "flex flex-col gap-3",
    card: "flex flex-col gap-3 rounded-[24px] bg-surface p-4",
    author: "text-foreground",
    meta: "text-muted",
    body: "whitespace-pre-wrap text-foreground",
    media:
      "flex h-36 items-center justify-center rounded-[18px] bg-background text-muted",
    actions: "flex items-center gap-1",
  },
});
