import { tv } from "tailwind-variants";

/** Sandow activity squircle — dark charcoal, large radius, tone-colored meta. */
export const welcomeActivityCardVariants = tv({
  slots: {
    root: [
      "flex h-[9.25rem] w-[8.25rem] flex-col justify-between rounded-[2rem] p-4",
      "border border-white/10 bg-[#18181b] text-white",
      "shadow-[0_18px_40px_-18px_rgba(0,0,0,0.65)]",
      "dark:border-white/10 dark:bg-[#18181b]",
    ],
    icon: "size-9 text-zinc-500",
    footer: "flex flex-col gap-1 border-0 p-0",
    title: "text-[1.125rem] leading-tight font-bold tracking-tight text-white",
    toneRow: "inline-flex items-center gap-1.5 text-[0.8125rem] font-medium",
    toneIcon: "size-3.5 shrink-0",
  },
  variants: {
    tone: {
      light: {
        toneRow: "text-amber-200",
        toneIcon: "text-accent",
      },
      calm: {
        toneRow: "text-sky-300",
        toneIcon: "text-sky-400",
      },
      intense: {
        toneRow: "text-rose-300",
        toneIcon: "text-rose-400",
      },
    },
  },
  defaultVariants: {
    tone: "light",
  },
});
