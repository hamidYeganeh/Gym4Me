import { tv } from "tailwind-variants";

export const coachSlotsManageDaysSectionVariants = tv({
  slots: {
    loading: "flex min-h-[50vh] items-center justify-center",
    days: "flex flex-col gap-5",
    day: "flex flex-col gap-2.5",
    dayLabel: "text-foreground",
    slotsRow: "flex flex-wrap gap-2",
    slotChip:
      "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium",
    slotOpen: "border-border bg-surface text-foreground",
    slotBooked: "border-success/40 bg-success/10 text-success",
    slotBlocked: "border-border bg-default text-muted",
    slotRemove: "text-muted transition-colors hover:text-danger",
    emptyDay: "text-muted",
  },
});
