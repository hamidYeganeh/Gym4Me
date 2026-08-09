import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const securitySettingsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-4 pb-12 pt-1",
    intro: "mb-2 flex flex-col gap-1",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    stack: "flex flex-col gap-2",
  },
});

export type SecuritySettingsScreenVariants = VariantProps<
  typeof securitySettingsScreenVariants
>;
