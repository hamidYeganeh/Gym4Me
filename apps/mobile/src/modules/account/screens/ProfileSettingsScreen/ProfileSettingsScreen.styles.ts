import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileSettingsScreenVariants = tv({
  slots: {
    root: "bg-background before:hidden",
    content: "flex flex-col gap-6 pb-12 pt-1",
    intro: "flex flex-col gap-1",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    privacy: "flex flex-col items-center gap-2 px-4 pt-2 text-center",
    privacyIcon: "text-muted",
    privacyText: "max-w-xs text-balance text-muted",
  },
});

export type ProfileSettingsScreenVariants = VariantProps<
  typeof profileSettingsScreenVariants
>;
