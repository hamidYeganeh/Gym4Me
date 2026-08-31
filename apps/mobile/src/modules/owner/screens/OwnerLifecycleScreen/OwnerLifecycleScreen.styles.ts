import { tv } from "tailwind-variants";

export const ownerLifecycleScreenVariants = tv({
  slots: {
    root: "min-h-dvh bg-background",
    content: "mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-28 pt-2",
    intro: "flex flex-col gap-1",
    introTitle: "text-foreground",
    introSubtitle: "text-muted",
    section: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    card: "rounded-[1.25rem] border-0 bg-surface p-4",
    row: "flex items-start justify-between gap-3 border-b border-separator py-3 last:border-b-0 last:pb-0 first:pt-0",
    rowTitle: "text-foreground",
    rowMeta: "text-muted",
    actions: "flex flex-col gap-2",
    empty: "border border-dashed border-border text-center text-muted",
  },
});
