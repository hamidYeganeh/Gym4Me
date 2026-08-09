import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: [
      "flex flex-1 flex-col gap-6 pt-2",
      "pb-[calc(6.5rem+env(safe-area-inset-bottom))]",
    ].join(" "),
    intro: "flex flex-col gap-1",
    stepper: "-mx-1 pt-2",
    stepPanel: "flex flex-col gap-6",
    stepCard:
      "flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5",
    stepTitle: "text-foreground",
    stepHint: "text-muted",
    error: "text-sm text-danger",
    notice: "text-sm text-success",
    navRow: "w-full gap-3",
    navBack: "h-14 flex-1",
    navNext: "h-14 flex-[2]",
  },
});

export type OwnerClubsCreateScreenVariants = VariantProps<
  typeof ownerClubsCreateScreenVariants
>;
