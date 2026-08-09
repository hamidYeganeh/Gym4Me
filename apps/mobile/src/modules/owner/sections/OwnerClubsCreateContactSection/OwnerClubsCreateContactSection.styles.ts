import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateContactSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5 rounded-[24px] border border-border bg-surface p-5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    form: "flex flex-col gap-4",
    group: "flex flex-col gap-3",
    groupTitle: "text-foreground",
    row: "flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface-secondary/40 p-3",
    rowFields: "flex flex-col gap-3 sm:flex-row",
    field: "flex w-full flex-col gap-2",
    rowActions: "flex justify-end",
  },
});

export type OwnerClubsCreateContactSectionVariants = VariantProps<
  typeof ownerClubsCreateContactSectionVariants
>;
