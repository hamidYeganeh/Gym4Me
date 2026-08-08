import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const baseProfileScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-8 pb-12 pt-2",
    actions: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    card: "flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5",
    form: "flex flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    fieldRow: "grid grid-cols-2 gap-3",
    formActions: "flex flex-col gap-3 pt-1",
    roleRow: "flex flex-wrap gap-2",
    notice: "text-sm text-success",
    error: "text-sm text-danger",
    kycCard:
      "flex flex-col gap-3 rounded-[24px] border border-accent/40 bg-accent/10 p-5",
    kycHint: "text-sm text-muted",
    privacy: "flex flex-col items-center gap-2 px-4 pt-2 text-center",
    privacyIcon: "text-muted",
    privacyText: "max-w-xs text-balance text-muted",
  },
});

export type BaseProfileScreenVariants = VariantProps<
  typeof baseProfileScreenVariants
>;
