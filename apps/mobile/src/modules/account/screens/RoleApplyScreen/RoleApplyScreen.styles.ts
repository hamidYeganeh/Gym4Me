import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const roleApplyScreenVariants = tv({
  slots: {
    root: "flex min-h-dvh flex-col gap-6 bg-background px-6 py-8",
    header: "flex flex-col gap-2",
    title: "text-2xl font-bold text-foreground",
    subtitle: "text-sm text-muted",
    list: "flex flex-col gap-3",
    error: "text-sm text-danger",
  },
});

export type RoleApplyScreenVariants = VariantProps<
  typeof roleApplyScreenVariants
>;
