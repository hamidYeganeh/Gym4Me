import { tv } from "tailwind-variants";

export const landingProgramsSectionStyles = tv({
  slots: {
    root: "landing-surface mt-3 rounded-(--radius-card-lg) bg-(--surface-soft) px-6 py-24 sm:px-10",
    title:
      "mt-4 text-5xl font-medium leading-[0.95] tracking-tight text-foreground",
    hint: "mt-4 max-w-xl text-sm text-muted",
    list: "mt-14 grid gap-4 md:grid-cols-3",
    card: "h-full w-full",
  },
});
