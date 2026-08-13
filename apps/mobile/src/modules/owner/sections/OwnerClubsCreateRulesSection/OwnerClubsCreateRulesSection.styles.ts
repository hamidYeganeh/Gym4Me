import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ownerClubsCreateRulesSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-5 shadow-sm shadow-foreground/5",
    header: "flex flex-col gap-1",
    title: "text-foreground",
    hint: "text-muted",
    list: "flex flex-col gap-3",
    ruleCard:
      "flex flex-col gap-3 rounded-2xl border border-border bg-background p-3",
    chips: "flex flex-wrap gap-2",
    field: "flex w-full flex-col gap-2",
    empty: "text-muted",
  },
});

export type OwnerClubsCreateRulesSectionVariants = VariantProps<
  typeof ownerClubsCreateRulesSectionVariants
>;
