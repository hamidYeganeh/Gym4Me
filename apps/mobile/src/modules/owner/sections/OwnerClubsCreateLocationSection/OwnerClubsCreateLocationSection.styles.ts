import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateLocationSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    form: "flex flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    mapWrap: "h-64 w-full overflow-hidden rounded-2xl",
    mapStatus: "text-sm text-muted",
  },
});

export type OwnerClubsCreateLocationSectionVariants = VariantProps<
  typeof ownerClubsCreateLocationSectionVariants
>;
