import { tv } from "tailwind-variants";

export const adminIconFieldVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    row: "flex items-center gap-2",
    preview:
      "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground",
    previewEmpty: "text-muted",
    input: "min-w-0 flex-1",
    actions: "flex shrink-0 items-center gap-1",
    dialog: "w-full max-w-3xl",
    modalBody: "flex min-h-0 flex-col gap-3",
    search: "w-full",
    meta: "text-xs text-muted",
    scroll:
      "h-[min(28rem,55vh)] overflow-auto rounded-xl border border-border bg-surface",
    gridRow: "absolute inset-x-0 grid grid-cols-4 gap-2 px-2 sm:grid-cols-6 md:grid-cols-8",
    cell: "flex h-20 flex-col items-center justify-center gap-1 rounded-lg border border-transparent px-1 text-center transition-colors hover:border-border hover:bg-surface-secondary",
    cellName: "w-full truncate text-[10px] leading-tight text-muted",
    empty: "flex h-full items-center justify-center p-6 text-sm text-muted",
  },
  variants: {
    selected: {
      true: {
        cell: "border-accent bg-accent/10 text-accent",
      },
    },
  },
});
