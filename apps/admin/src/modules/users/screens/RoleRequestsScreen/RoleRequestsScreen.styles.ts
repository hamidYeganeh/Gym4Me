import { tv } from "tailwind-variants";

export const roleRequestsScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[1500px] flex-col gap-5",
    header: "flex flex-wrap items-start justify-between gap-4",
    filters: "flex flex-wrap items-center gap-2",
    select:
      "rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground",
    list: "flex flex-col gap-3",
    row: "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface p-4",
    rowMain: "flex min-w-0 flex-1 flex-col gap-1",
    rowActions: "flex flex-wrap gap-2",
    error: "text-danger",
    modalBody: "flex flex-col gap-3",
  },
});
