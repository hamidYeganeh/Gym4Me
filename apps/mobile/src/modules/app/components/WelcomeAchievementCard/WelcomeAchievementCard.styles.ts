import { tv } from "tailwind-variants";

export const welcomeAchievementCardVariants = tv({
  slots: {
    root: [
      "flex aspect-[4/5] w-full flex-col items-center justify-center gap-4",
      "rounded-[2rem] border border-white/10 bg-surface px-4 py-6",
      "shadow-[0_22px_44px_-20px_rgba(0,0,0,0.7)]",
    ],
    badgeWrap: "relative flex size-[4.75rem] items-center justify-center",
    badgeSvg:
      "absolute inset-0 size-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]",
    badgeIcon: "relative z-10 size-7 text-white",
    copy: "flex flex-col items-center gap-1 text-center",
    title: "text-[0.95rem] leading-tight font-bold tracking-tight text-white",
    status: "text-xs text-white/55",
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
