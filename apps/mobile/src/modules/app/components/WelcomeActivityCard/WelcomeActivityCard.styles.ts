import { tv } from "tailwind-variants";

export const welcomeActivityCardVariants = tv({
  slots: {
    root: [
      "flex h-[11.5rem] w-[9.75rem] flex-col justify-between rounded-[1.75rem] border border-border bg-surface p-4",
      "text-surface-foreground",
      "shadow-[0_16px_36px_-16px_color-mix(in_oklab,var(--foreground)_18%,transparent)]",
    ],
    icon: "size-9 text-muted",
    footer: "flex flex-col gap-1.5 border-0 p-0",
    title: "text-[1.15rem] leading-tight font-bold tracking-tight text-foreground",
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
