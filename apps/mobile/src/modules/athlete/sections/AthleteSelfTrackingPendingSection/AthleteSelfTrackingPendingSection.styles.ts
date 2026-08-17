import { tv } from "tailwind-variants";

export const athleteSelfTrackingPendingSectionVariants = tv({
  slots: {
    root: "flex items-center justify-between gap-3 rounded-3xl border border-warning/30 bg-warning/10 p-4",
    copy: "flex min-w-0 flex-col gap-1",
    meta: "text-muted",
  },
});
