import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const roleApplyScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-8 pb-12 pt-2",
    header: "flex flex-col gap-1",
    subtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    section: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    sectionHint: "text-pretty text-muted",
    list: "flex flex-col gap-3",
    error: "text-sm text-danger",
  },
});

export type RoleApplyScreenVariants = VariantProps<
  typeof roleApplyScreenVariants
>;
