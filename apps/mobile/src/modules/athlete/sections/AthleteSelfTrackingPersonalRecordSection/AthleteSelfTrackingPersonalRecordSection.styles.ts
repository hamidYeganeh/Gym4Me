import { tv } from "tailwind-variants";

export const athleteSelfTrackingPersonalRecordSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4",
    form: "flex flex-col gap-4",
    grid: "grid grid-cols-2 gap-3",
    meta: "text-muted",
    nativeSelect:
      "min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent",
  },
});
