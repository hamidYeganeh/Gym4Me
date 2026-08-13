import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileIdentitySectionVariants = tv({
  slots: {
    root: "flex flex-col items-center gap-4 text-center",
    avatarWrap: [
      "relative flex size-28 items-center justify-center overflow-hidden rounded-[2rem]",
      "bg-surface ring-2 ring-accent/70 ring-offset-4 ring-offset-background",
      "shadow-[0_0_32px_color-mix(in_oklch,var(--accent)_28%,transparent)]",
    ].join(" "),
    avatar: "size-full rounded-[inherit]",
    avatarImage: "size-full object-cover",
    roleChip: [
      "[--chip-bg:color-mix(in_oklch,var(--accent)_18%,transparent)]",
      "[--chip-fg:var(--accent)]",
      "[&_.chip__label]:text-xs [&_.chip__label]:font-bold [&_.chip__label]:tracking-wide",
    ].join(" "),
    name: "tracking-tight text-foreground",
    subtitle: "max-w-sm text-balance text-muted",
  },
});

export type ProfileIdentitySectionVariants = VariantProps<
  typeof profileIdentitySectionVariants
>;
