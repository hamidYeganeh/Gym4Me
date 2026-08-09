import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateIdentitySectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    form: "flex flex-col gap-4",
    field: "flex w-full flex-col gap-2",
  },
});

export type OwnerClubsCreateIdentitySectionVariants = VariantProps<
  typeof ownerClubsCreateIdentitySectionVariants
>;
