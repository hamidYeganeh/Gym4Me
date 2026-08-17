import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateHoursSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    group: "flex flex-col gap-3",
    groupTitle: "text-foreground",
    chips: "flex flex-wrap gap-2",
    hoursList: "flex flex-col gap-3",
    hourRow:
      "flex flex-col gap-3 rounded-2xl border border-border bg-background px-3 py-3",
    hourTop: "flex items-center justify-between gap-3",
    dayLabel: "text-foreground",
    timeRow: "grid grid-cols-2 gap-3",
    field: "flex w-full flex-col gap-1.5",
  },
});

export type OwnerClubsCreateHoursSectionVariants = VariantProps<
  typeof ownerClubsCreateHoursSectionVariants
>;
