import { tv } from "tailwind-variants";

export const landingStatsSectionStyles = tv({
  slots: {
    root: [
      "mt-3 rounded-(--radius-card-lg) bg-surface-secondary",
      "px-6 py-20 text-foreground sm:px-10",
    ],
    title: "mt-4 text-5xl font-bold leading-[0.95] tracking-tight",
    hint: "mt-4 max-w-xl text-sm text-muted",
    grid: "mt-16 flex flex-wrap justify-center gap-4 lg:justify-start",
    card: "w-[150px]",
  },
});
