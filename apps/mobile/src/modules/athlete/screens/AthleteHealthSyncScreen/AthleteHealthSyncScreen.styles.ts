import { tv } from "tailwind-variants";

export const athleteHealthSyncScreenVariants = tv({
  slots: {
    root: "min-h-dvh bg-background",
    content: "flex flex-col gap-6 px-4 pb-28 pt-4",
    intro: "flex flex-col gap-2",
    subtitle: "text-muted",
    card: "flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4",
    actions: "flex flex-col gap-2",
    list: "flex flex-col gap-3",
    row: "flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3",
    rowTop: "flex items-start justify-between gap-2",
    meta: "text-muted",
    empty: "border border-dashed border-border text-center text-muted",
    feedback: "rounded-xl bg-success/10 px-3 py-2 text-sm text-success",
    error: "text-danger",
  },
});
