import { tv } from "tailwind-variants";

export const articleDetailScreenVariants = tv({
  slots: {
    root: "flex min-h-0 flex-1 flex-col bg-background",
    content: "flex flex-col gap-6 px-4 pb-10 pt-2",
    hero: "flex flex-col gap-4 rounded-3xl bg-surface p-5",
    categoryChip:
      "inline-flex w-fit items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-xs font-semibold text-eclipse",
    title: "tracking-tight text-foreground",
    meta: "flex flex-wrap items-center gap-2 text-sm text-muted",
    authorRow: "flex items-center gap-2",
    authorName: "text-sm text-muted",
    body: "flex flex-col gap-4 text-foreground/90 leading-8 [&_h2]:mt-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:ps-5",
    actions: "flex items-center gap-2 border-t border-border pt-4",
    actionButton:
      "min-w-0 flex-1 justify-center gap-2 text-muted data-[pressed=true]:bg-surface",
    actionActive: "text-warning",
    relatedSection: "flex flex-col gap-3",
    relatedTitle: "tracking-tight",
    relatedScroller:
      "-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    relatedCard: "w-[min(100%,22rem)] shrink-0",
    loading: "py-20 text-center text-muted",
    error: "py-20 text-center text-danger",
  },
});
