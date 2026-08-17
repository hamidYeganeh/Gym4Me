import { tv } from "tailwind-variants";

export const athleteWorkoutDetailIntroSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    title: "tracking-tight text-foreground",
    subtitle: "text-muted",
    metaRow: "flex flex-wrap items-center gap-2",
    meta: "text-muted",
  },
});
