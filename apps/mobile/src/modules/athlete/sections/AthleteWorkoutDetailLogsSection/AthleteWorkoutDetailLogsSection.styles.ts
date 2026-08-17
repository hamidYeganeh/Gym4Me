import { tv } from "tailwind-variants";

export const athleteWorkoutDetailLogsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    sectionTitle: "text-muted",
    list: "flex flex-col gap-3",
    card: "flex flex-col gap-2 rounded-[24px] border-0 bg-surface p-4",
    cardTop: "flex items-start justify-between gap-2",
    meta: "text-muted",
    empty:
      "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
  },
});
