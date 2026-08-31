import { tv } from "tailwind-variants";

export const athleteSelfTrackingHistorySectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4",
    history: "flex flex-col gap-3",
    historyRow:
      "flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3",
    historyCopy: "flex min-w-0 flex-col gap-1",
    meta: "text-muted",
    empty: "border border-dashed border-border text-center text-muted",
  },
});
