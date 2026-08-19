import { tv } from "tailwind-variants";

export const foodItemsFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    formError: "text-sm text-danger",
    status: "flex min-h-12 items-center",
    statusText: "text-sm text-muted",
    select: "w-full",
    macroGrid: "grid grid-cols-2 gap-3",
  },
});
