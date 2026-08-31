import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const roleRequestWizardScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-12 pt-2",
    subtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    form: "flex flex-col gap-4",
    field: "w-full",
    upload: "flex flex-col gap-2 border border-border/60",
    error: "text-sm text-danger",
    notice: "text-sm text-success",
    reject: "bg-danger/10 text-sm text-danger",
  },
});

export type RoleRequestWizardScreenVariants = VariantProps<
  typeof roleRequestWizardScreenVariants
>;
