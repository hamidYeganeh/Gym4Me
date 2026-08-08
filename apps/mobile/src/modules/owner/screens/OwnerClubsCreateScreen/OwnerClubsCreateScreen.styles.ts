import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-1 flex-col gap-6 pb-10 pt-2",
    intro: "flex flex-col gap-1",
    stepper: "pt-2",
    stepCard:
      "flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5",
    stepTitle: "text-foreground",
    stepHint: "text-muted",
    form: "flex flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    reviewRow: "flex items-start justify-between gap-3 py-2.5",
    reviewLabel: "shrink-0 text-muted",
    reviewValue: "min-w-0 text-end text-foreground",
    reviewDivider: "h-px bg-border last:hidden",
    error: "text-sm text-danger",
    notice: "text-sm text-success",
    status:
      "rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground",
    navRow: "flex gap-3 pt-1",
    navBack: "flex-1",
    navNext: "flex-[2]",
    upload: "flex flex-col gap-3",
    uploadInput: "text-sm text-muted file:me-3",
  },
});

export type OwnerClubsCreateScreenVariants = VariantProps<
  typeof ownerClubsCreateScreenVariants
>;
