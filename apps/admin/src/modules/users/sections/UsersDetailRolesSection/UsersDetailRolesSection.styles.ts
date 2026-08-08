import { tv } from "tailwind-variants";

export const usersDetailRolesSectionVariants = tv({
  slots: {
    card: "border-0 shadow-none",
    content: "flex flex-col gap-5",
    facts: "flex flex-col gap-3",
    factRow: "flex items-center justify-between gap-4 py-1",
    factLabel: "text-sm text-muted",
    factValue: "text-sm font-semibold text-foreground",
  },
});
