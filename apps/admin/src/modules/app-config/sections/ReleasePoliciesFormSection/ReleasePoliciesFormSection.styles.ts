import { tv } from "tailwind-variants";

export const releasePoliciesFormSectionVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-1.5",
    actions: "flex flex-wrap gap-2",
  },
});
