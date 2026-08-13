import { tv } from "tailwind-variants";

export const foodItemsFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    formError: "text-sm text-danger",
    macroGrid: "grid grid-cols-2 gap-3",
  },
});
