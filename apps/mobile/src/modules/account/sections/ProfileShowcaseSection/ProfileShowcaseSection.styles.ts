import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileShowcaseSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-6",
    block: "flex flex-col gap-3",
    blockTitle: "text-foreground",
    tags: "flex flex-wrap justify-center gap-2",
    tag: [
      "border-0 bg-surface",
      "[--chip-bg:var(--surface)] [--chip-fg:var(--foreground)]",
      "[&_.chip__label]:text-sm [&_.chip__label]:font-medium",
    ].join(" "),
    benefits:
      "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-5",
    benefitRow: "flex items-center gap-3",
    benefitIcon:
      "flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground",
    benefitLabel: "text-foreground",
    achievements: "grid grid-cols-3 gap-3",
    achievementCard: [
      "flex min-h-[7.5rem] flex-col items-center justify-center gap-2",
      "rounded-[1.5rem] border-0 bg-surface px-2 py-4 text-center",
    ].join(" "),
    achievementIcon: [
      "flex size-12 items-center justify-center rounded-2xl",
      "bg-default text-foreground",
    ].join(" "),
    achievementLabel: "text-sm text-foreground",
    achievementStatus: "text-xs text-muted",
  },
  variants: {
    tone: {
      accent: {
        achievementIcon: "bg-accent text-accent-foreground",
      },
      "stats-red": {
        achievementIcon: "bg-stats-red text-stats-foreground",
      },
      "stats-blue": {
        achievementIcon: "bg-stats-blue text-stats-foreground",
      },
      "stats-yellow": {
        achievementIcon: "bg-stats-yellow text-stats-foreground",
      },
      "stats-purple": {
        achievementIcon: "bg-stats-purple text-stats-foreground",
      },
      "stats-orange": {
        achievementIcon: "bg-stats-orange text-stats-foreground",
      },
      muted: {
        achievementIcon: "bg-default text-muted",
      },
    },
  },
  defaultVariants: {
    tone: "accent",
  },
});

export type ProfileShowcaseSectionVariants = VariantProps<
  typeof profileShowcaseSectionVariants
>;
