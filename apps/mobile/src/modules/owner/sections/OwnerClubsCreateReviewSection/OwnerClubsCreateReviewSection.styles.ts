import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateReviewSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5 rounded-[24px] border-0 bg-surface p-5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    status:
      "rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground",
    sections: "flex flex-col gap-4",
    block:
      "flex flex-col gap-3 rounded-[1.25rem] border-0 bg-surface-secondary/30 p-4",
    blockTitle: "text-foreground",
    fields: "flex flex-col",
    reviewRow: "flex items-start justify-between gap-3 py-2.5",
    reviewLabel: "shrink-0 text-sm text-muted",
    reviewValue:
      "min-w-0 whitespace-pre-wrap break-words text-end text-sm text-foreground",
    reviewDivider: "h-px bg-border",
    list: "flex flex-col gap-2",
    listItem:
      "flex flex-col gap-0.5 rounded-xl border border-border/60 bg-background px-3 py-2.5",
    listPrimary: "text-sm font-medium text-foreground",
    listSecondary: "break-all text-sm text-muted",
    listMeta: "text-xs text-muted",
    mediaGrid: "grid grid-cols-2 gap-2",
    mediaCard: "overflow-hidden rounded-xl border border-border bg-background",
    mediaImage: "aspect-[4/3] w-full object-cover",
    mediaCaption: "truncate px-2 py-1.5 text-xs text-muted",
    hourGroup: "flex flex-col gap-1.5",
    hourGroupTitle: "text-sm font-semibold text-foreground",
    empty: "text-sm text-muted",
    upload: "flex flex-col gap-3",
  },
});

export type OwnerClubsCreateReviewSectionVariants = VariantProps<
  typeof ownerClubsCreateReviewSectionVariants
>;
