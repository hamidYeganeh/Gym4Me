import { tv } from "tailwind-variants";

export const notificationTemplatesFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-2",
    chips: "flex flex-wrap gap-1.5",
    formError: "text-sm text-danger",
  },
});
