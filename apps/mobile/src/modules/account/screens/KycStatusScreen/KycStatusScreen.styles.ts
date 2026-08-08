import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const kycStatusScreenVariants = tv({
  slots: {
    root: "flex min-h-dvh flex-col gap-6 bg-background px-6 py-8",
    header: "flex flex-col gap-2",
    title: "text-2xl font-bold text-foreground",
    subtitle: "text-sm text-muted",
    statusCard:
      "rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground",
    form: "flex flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    error: "text-sm text-danger",
    notice: "text-sm text-success",
    actions: "flex flex-col gap-3",
  },
});

export type KycStatusScreenVariants = VariantProps<
  typeof kycStatusScreenVariants
>;
