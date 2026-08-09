import { tv } from "tailwind-variants";

export const welcomeActivityCardVariants = tv({
  slots: {
    root: [
      "flex h-[11.5rem] w-[9.75rem] flex-col justify-between rounded-[1.75rem] border border-white/10 bg-[#1c1c1e] p-4",
      "shadow-[0_22px_40px_-18px_rgba(0,0,0,0.75)]",
    ],
    icon: "size-9 text-white/40",
    footer: "flex flex-col gap-1.5 border-0 p-0",
    title: "text-[1.15rem] leading-tight font-bold tracking-tight text-white",
    toneRow: "inline-flex items-center gap-1.5 text-[0.8rem] font-medium",
    toneIcon: "size-3.5 shrink-0",
  },
  variants: {
    tone: {
      light: {
        toneRow: "text-accent",
        toneIcon: "text-accent",
      },
      calm: {
        toneRow: "text-stats-blue",
        toneIcon: "text-stats-blue",
      },
      intense: {
        toneRow: "text-danger",
        toneIcon: "text-danger",
      },
    },
  },
  defaultVariants: {
    tone: "light",
  },
});
