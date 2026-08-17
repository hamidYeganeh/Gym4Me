import { tv } from "tailwind-variants";

export const coachProgramsIntroSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-6",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
  },
});
