import { tv } from "tailwind-variants";

export const welcomeWorkoutCardVariants = tv({
  slots: {
    root: [
      "relative flex h-full min-h-[min(48dvh,22rem)] w-full flex-col justify-between overflow-hidden",
      "rounded-[1.75rem] border border-white/10 bg-surface p-4",
      "shadow-[0_20px_40px_-18px_rgba(0,0,0,0.55)]",
    ],
    header: "flex w-full flex-row items-start justify-between gap-3 p-0",
    category:
      "h-7 border-0 px-3 text-[0.7rem] font-semibold tracking-wide text-white",
    bookmark: [
      "size-10 shrink-0 rounded-full border border-white/25 bg-transparent text-white",
      "shadow-none data-[hovered=true]:bg-white/5 data-[pressed=true]:scale-95",
      "[&_svg]:size-4",
    ],
    body: "mt-auto flex w-full flex-col gap-4 p-0",
    copy: "flex flex-col gap-1",
    title:
      "text-balance text-[1.15rem] leading-snug font-bold tracking-tight text-white",
    coach: "text-sm text-white/55",
    stats: "flex w-full items-end justify-between gap-2",
    stat: "flex min-w-0 flex-1 flex-col gap-0.5",
    statRow: "flex items-center gap-1.5",
    statIcon: "size-4 shrink-0",
    statValue: "text-base leading-none font-bold text-white",
    statUnit: "ps-[1.375rem] text-[0.7rem] leading-none text-white/55",
  },
  variants: {
    categoryTone: {
      blue: { category: "bg-stats-blue" },
      accent: { category: "bg-accent text-accent-foreground" },
      purple: { category: "bg-stats-purple" },
    },
  },
  defaultVariants: {
    categoryTone: "blue",
  },
});
