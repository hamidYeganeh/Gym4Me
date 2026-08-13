import { tv } from "tailwind-variants";

export const choicesFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    optionsList: "flex flex-col gap-3",
    optionRow:
      "grid gap-3 rounded-2xl bg-surface p-3 sm:grid-cols-[1fr_1fr_auto]",
    optionActions: "flex items-end gap-2",
    formError: "text-sm text-danger",
  },
});
