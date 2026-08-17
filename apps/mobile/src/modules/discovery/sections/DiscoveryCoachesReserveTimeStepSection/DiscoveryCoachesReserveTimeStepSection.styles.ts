import { tv } from "tailwind-variants";

export const discoveryCoachesReserveTimeStepSectionVariants = tv({
  slots: {
    weekRow: "flex items-center justify-between",
    weekLabel: "text-foreground",
    weekNav: "flex items-center gap-2",
    weekButton: "size-10 rounded-full bg-surface-secondary text-foreground",
    weekButtonIcon: "text-foreground",
    locationCard:
      "flex flex-col gap-1 rounded-[1.25rem] border-0 bg-surface-secondary p-4",
    locationTitle: "text-foreground",
    locationAddress: "text-muted",
    remoteHint:
      "rounded-[1.25rem] border-0 bg-surface-secondary p-4 text-muted",
    emptySlots:
      "rounded-2xl border border-dashed border-separator p-6 text-center text-muted",
  },
});
