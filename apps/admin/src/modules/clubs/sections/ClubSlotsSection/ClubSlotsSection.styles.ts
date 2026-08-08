import { tv } from "tailwind-variants";

export const clubSlotsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex flex-wrap items-center justify-between gap-2",
    title: "text-base font-semibold text-foreground",
    list: "flex flex-col gap-2",
    row: [
      "flex flex-col gap-2 rounded-xl border border-border bg-default/40 p-3",
      "sm:flex-row sm:items-center sm:justify-between",
    ].join(" "),
    meta: "min-w-0 text-sm text-foreground",
    muted: "text-xs text-muted",
    actions: "flex flex-wrap gap-2",
    form: "flex flex-col gap-3",
    field: "flex flex-col gap-1.5",
    label: "text-sm text-muted",
    error: "text-sm text-danger",
  },
});
