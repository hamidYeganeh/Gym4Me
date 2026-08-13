import { tv } from "tailwind-variants";

export const pointRulesFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-2",
    chips: "flex flex-wrap gap-1.5",
    awardsGrid: "grid gap-3 sm:grid-cols-3",
    formRow: "grid gap-4 sm:grid-cols-2",
    hint: "text-xs text-muted",
    formError: "text-sm text-danger",
  },
});
