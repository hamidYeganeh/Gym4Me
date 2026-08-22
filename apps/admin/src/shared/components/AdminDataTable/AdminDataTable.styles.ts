import { tv } from "tailwind-variants";

export const adminDataTableVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-3",
    toolbar: "flex flex-wrap items-end gap-3",
    empty: "px-6 py-16 text-center text-sm text-muted",
    loading:
      "flex items-center justify-center gap-3 px-6 py-16 text-sm text-muted",
    error: "px-4 py-3 text-sm text-danger",
    scroll: "max-h-[min(70vh,720px)] overflow-auto",
    table: "w-full min-w-[960px] table-fixed",
    header: "sticky top-0 z-10 bg-surface-secondary",
    interactiveRow:
      "cursor-pointer outline-none transition-colors data-[hovered=true]:bg-accent/5 focus-visible:bg-accent/10",
    spacerCell: "!border-0 !p-0 !bg-transparent",
    footer:
      "flex w-full flex-wrap items-center justify-between gap-3 px-1 text-sm text-muted",
    loadMore: "flex items-center justify-center gap-2 text-sm text-muted",
  },
});
