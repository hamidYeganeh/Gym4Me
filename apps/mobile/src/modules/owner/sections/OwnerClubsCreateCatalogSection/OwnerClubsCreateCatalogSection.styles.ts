import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateCatalogSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    chips: "flex flex-wrap gap-2",
  },
});

export type OwnerClubsCreateCatalogSectionVariants = VariantProps<
  typeof ownerClubsCreateCatalogSectionVariants
>;
