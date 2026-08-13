import { tv } from "tailwind-variants";

export const welcomeAchievementCardVariants = tv({
  slots: {
    root: [
      "flex aspect-[4/5] w-full flex-col items-center justify-center gap-4",
      "rounded-[2rem] border-0 bg-surface px-4 py-6 text-surface-foreground shadow-sm shadow-foreground/5",
      "shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--foreground)_18%,transparent)]",
    ],
    badgeWrap: "relative flex size-[4.75rem] items-center justify-center",
    badgeSvg:
      "absolute inset-0 size-full drop-shadow-[0_8px_16px_color-mix(in_oklab,var(--foreground)_28%,transparent)]",
    badgeIcon: "relative z-10 size-7 text-stats-foreground",
    copy: "flex flex-col items-center gap-1 text-center",
    title:
      "text-[0.95rem] leading-tight font-bold tracking-tight text-foreground",
    status: "text-xs text-muted",
  },
  variants: {
    tone: {
      orange: {},
      blue: {},
      silver: {},
    },
  },
  defaultVariants: {
    tone: "orange",
  },
});
