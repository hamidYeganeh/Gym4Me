import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateLocationSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    form: "flex flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    fieldLabel: "text-sm font-bold text-foreground",
    trigger: [
      "flex h-14 min-h-14 w-full items-center gap-3 rounded-2xl border border-border",
      "bg-transparent px-4 text-start shadow-none",
      "data-[hovered=true]:bg-default/40",
    ].join(" "),
    triggerIcon: "shrink-0 text-muted",
    triggerValue: "min-w-0 flex-1 truncate text-sm text-foreground",
    triggerPlaceholder: "min-w-0 flex-1 truncate text-sm text-muted",
    triggerTrailing: "shrink-0 text-muted",
    mapWrap: "h-64 w-full overflow-hidden rounded-2xl",
    mapStatus: "text-sm text-muted",
  },
});

export type OwnerClubsCreateLocationSectionVariants = VariantProps<
  typeof ownerClubsCreateLocationSectionVariants
>;
