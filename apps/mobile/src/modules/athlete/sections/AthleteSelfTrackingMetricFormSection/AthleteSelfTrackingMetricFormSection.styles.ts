import { tv } from "tailwind-variants";

export const athleteSelfTrackingMetricFormSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4",
    form: "flex flex-col gap-4",
    grid: "grid grid-cols-2 gap-3",
    meta: "text-muted",
    feedback: "rounded-xl bg-success/10 px-3 py-2 text-sm text-success",
    error: "rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger",
  },
});
