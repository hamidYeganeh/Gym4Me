import { tv } from "tailwind-variants";

export const socialReportsResolveDrawerSectionVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-1.5",
    subtitle: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    actions: "flex flex-wrap gap-2",
  },
});
