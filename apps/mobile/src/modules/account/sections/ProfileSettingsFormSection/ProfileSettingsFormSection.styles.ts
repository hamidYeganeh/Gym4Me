import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileSettingsFormSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-7",
    section: "flex flex-col gap-3.5",
    sectionHead: "mb-0.5 flex items-center gap-2",
    sectionIcon: "size-5 text-accent",
    sectionTitle: "text-base font-bold text-foreground",
    phonePrefix: "flex items-center gap-1.5 text-sm font-semibold text-foreground",
    error: "text-sm text-danger",
    notice: "text-sm text-success",
    actions: "flex flex-col gap-3 pt-2",
    submit: "h-14 min-h-14 rounded-2xl",
  },
});

export type ProfileSettingsFormSectionVariants = VariantProps<
  typeof profileSettingsFormSectionVariants
>;
