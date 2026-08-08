import { tv } from "tailwind-variants";

export const usersCreateFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    formRow: "grid gap-4 sm:grid-cols-2",
    formError: "text-sm text-danger",
  },
});
