import { tv } from "tailwind-variants";

export const locationsFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    formRow: "grid gap-4 sm:grid-cols-2",
    flagPreview:
      "inline-flex overflow-hidden rounded border border-border",
    formError: "text-sm text-danger",
  },
});
