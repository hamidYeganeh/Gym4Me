import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateMediaSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5 rounded-[24px] border border-border bg-surface p-5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    group: "flex flex-col gap-3",
    groupTitle: "text-foreground",
    stack: "flex flex-col gap-3",
    preview:
      "relative overflow-hidden rounded-2xl border border-border bg-surface-secondary",
    image: "aspect-[16/9] w-full object-cover",
  },
});

export type OwnerClubsCreateMediaSectionVariants = VariantProps<
  typeof ownerClubsCreateMediaSectionVariants
>;
