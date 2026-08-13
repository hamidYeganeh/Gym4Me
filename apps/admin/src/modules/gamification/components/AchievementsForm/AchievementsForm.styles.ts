import { tv } from "tailwind-variants";

export const achievementsFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-2",
    chips: "flex flex-wrap gap-1.5",
    formRow: "grid gap-4 sm:grid-cols-2",
    formError: "text-sm text-danger",
  },
});
