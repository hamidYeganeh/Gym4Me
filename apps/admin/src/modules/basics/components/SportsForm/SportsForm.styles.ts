import { tv } from "tailwind-variants";

export const sportsFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    formError: "text-sm text-danger",
  },
});
