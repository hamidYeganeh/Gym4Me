import { tv } from "tailwind-variants";

export const releasePoliciesFormSectionVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-1.5",
    notesHeader: "flex items-center justify-between gap-3",
    featuresList: "flex flex-col gap-2",
    featureRow: "flex items-start gap-2",
    actions: "flex flex-wrap gap-2",
  },
});
