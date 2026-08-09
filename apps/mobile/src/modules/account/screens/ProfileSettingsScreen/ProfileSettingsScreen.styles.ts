import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileSettingsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-12 pt-1",
    intro: "flex flex-col gap-1",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    avatarWrap: "flex justify-center py-2",
    avatar: [
      "flex size-28 items-center justify-center rounded-full",
      "border border-dashed border-border bg-surface text-muted",
    ].join(" "),
    form: "flex flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    fieldRow: "grid grid-cols-2 gap-3",
    formActions: "flex flex-col gap-3 pt-2",
    notice: "text-sm text-success",
    error: "text-sm text-danger",
    privacy: "flex flex-col items-center gap-2 px-4 pt-2 text-center",
    privacyIcon: "text-muted",
    privacyText: "max-w-xs text-balance text-muted",
  },
});

export type ProfileSettingsScreenVariants = VariantProps<
  typeof profileSettingsScreenVariants
>;
