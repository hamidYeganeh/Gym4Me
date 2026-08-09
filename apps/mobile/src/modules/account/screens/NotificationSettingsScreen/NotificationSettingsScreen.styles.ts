import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const notificationSettingsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-12 pt-1",
    intro: "flex flex-col gap-1",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    group: "flex flex-col gap-2",
    groupTitle: "px-1 text-muted",
    stack: "flex flex-col gap-2",
  },
});

export type NotificationSettingsScreenVariants = VariantProps<
  typeof notificationSettingsScreenVariants
>;
