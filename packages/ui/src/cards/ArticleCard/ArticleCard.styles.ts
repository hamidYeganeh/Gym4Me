import { tv } from "tailwind-variants";

export const articleCardVariants = tv({
  slots: {
    root: [
      "group relative overflow-hidden rounded-[1.75rem]",
      "border border-border bg-surface text-start text-foreground",
      "shadow-none transition-colors",
      "hover:bg-surface-secondary",
    ].join(" "),
    pressable: [
      "flex h-full w-full items-stretch justify-start rounded-none",
      "bg-transparent p-0 text-start text-foreground shadow-none",
      "data-[hovered=true]:bg-transparent data-[pressed=true]:bg-transparent",
      "data-[pressed=true]:scale-[0.99]",
    ].join(" "),
    cover: "relative shrink-0 overflow-hidden bg-background",
    coverImage: "size-full object-cover",
    body: "flex min-w-0 flex-1 flex-col",
    meta: "flex flex-wrap items-center gap-x-1.5 text-sm text-muted",
    metaDot: "text-muted/70",
    category: "text-muted",
    title: "tracking-tight text-foreground",
    engagement:
      "flex flex-wrap items-center gap-x-1.5 text-sm text-muted [&_svg]:shrink-0",
    engagementItem: "inline-flex items-center gap-1.5",
    footer: "mt-auto flex items-center justify-between gap-3",
    author: "flex min-w-0 items-center gap-2",
    authorName: "truncate text-muted",
    duration: "inline-flex shrink-0 items-center gap-1.5 text-sm text-muted",
    iconAffordance: "shrink-0 text-muted",
    saveButton:
      "size-9 shrink-0 text-muted data-[pressed=true]:bg-transparent data-[hovered=true]:bg-transparent data-[hovered=true]:text-foreground",
    saveButtonActive: "text-warning",
  },
  variants: {
    variant: {
      stacked: {
        root: "flex h-full w-full flex-col",
        pressable: "flex-col",
        cover: "aspect-[4/3] w-full",
        body: "gap-3 p-5",
        category: "text-sm",
        title: "line-clamp-3 text-xl font-bold leading-snug",
        authorName: "text-sm",
        iconAffordance: "size-6",
      },
      row: {
        root: "w-full",
        pressable: "flex-row gap-4 p-3",
        cover: "size-[7.5rem] rounded-2xl sm:size-32",
        body: "justify-between gap-2 py-0.5 pe-1",
        category:
          "text-[0.7rem] font-bold uppercase tracking-[0.08em] text-foreground/70",
        title: "line-clamp-2 text-base font-bold leading-snug sm:text-lg",
        authorName: "text-sm",
        iconAffordance: "size-5",
      },
      feed: {
        root: "w-full",
        pressable: "flex-col",
        cover: "hidden",
        body: "gap-3 p-5",
        meta: "text-sm",
        title: "line-clamp-3 text-xl font-bold leading-snug sm:text-2xl",
        engagement: "gap-x-2 text-sm",
      },
    },
  },
  defaultVariants: {
    variant: "stacked",
  },
});
