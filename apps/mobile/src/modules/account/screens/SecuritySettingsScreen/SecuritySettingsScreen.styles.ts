import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const securitySettingsScreenVariants = tv({
  slots: {
    root: "bg-background before:hidden",
    content: "flex flex-col gap-6 pb-12 pt-2",
    intro: "flex flex-col gap-1.5",
    introTitle: "text-balance tracking-tight text-foreground",
    introSubtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    stack: "flex flex-col gap-2",
    row: "border border-border",
  },
});

export type SecuritySettingsScreenVariants = VariantProps<
  typeof securitySettingsScreenVariants
>;
