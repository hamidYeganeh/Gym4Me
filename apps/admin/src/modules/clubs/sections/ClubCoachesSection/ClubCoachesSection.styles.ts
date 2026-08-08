import { tv } from "tailwind-variants";

export const clubCoachesSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    title: "text-base font-semibold text-foreground",
    formRow: "flex flex-wrap items-center gap-2",
    list: "space-y-2",
    item: "flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm",
    itemLabel: "font-medium text-foreground",
    itemId: "ms-auto text-muted tabular-nums text-xs",
    empty: "text-sm text-muted",
    error: "text-sm text-danger",
  },
});
