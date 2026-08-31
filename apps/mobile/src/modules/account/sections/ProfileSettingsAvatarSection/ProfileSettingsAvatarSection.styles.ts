import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileSettingsAvatarSectionVariants = tv({
  slots: {
    root: "relative mx-auto size-28",
    avatar: [
      "size-28 overflow-hidden rounded-full",
      "border border-border bg-accent/10 text-accent shadow-sm",
    ].join(" "),
    image: "size-full object-cover",
    fallback: "flex size-full items-center justify-center bg-accent/15 text-accent",
    overlay: [
      "absolute inset-0 flex items-center justify-center rounded-full",
      "bg-background/60",
    ].join(" "),
    edit: [
      "absolute -bottom-0.5 -end-0.5 min-w-8",
      "!bg-foreground !text-background shadow-sm",
    ].join(" "),
    hiddenInput: "sr-only",
  },
});

export type ProfileSettingsAvatarSectionVariants = VariantProps<
  typeof profileSettingsAvatarSectionVariants
>;
