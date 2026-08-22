import { tv } from "tailwind-variants";

export const onboardingMoodSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-6",
    row: "flex w-full items-center justify-between gap-2",
    face: "flex size-[4.25rem] shrink-0 items-center justify-center rounded-[1.25rem] transition-[background-color,box-shadow,transform,color] duration-fast ease-app sm:size-20",
    faceIcon: "size-9 sm:size-10",
    statement: "text-center text-base font-semibold text-foreground",
  },
  variants: {
    mood: {
      depressed: {
        face: "bg-stats-blue/15 text-stats-blue",
        faceIcon: "text-stats-blue",
      },
      sad: {
        face: "bg-stats-purple/15 text-stats-purple",
        faceIcon: "text-stats-purple",
      },
      neutral: {
        face: "bg-default text-muted",
        faceIcon: "text-muted",
      },
      happy: {
        face: "bg-success/15 text-success",
        faceIcon: "text-success",
      },
      overjoyed: {
        face: "bg-accent/20 text-accent",
        faceIcon: "text-accent",
      },
    },
    active: {
      true: {
        face: "scale-105 shadow-[0_0_24px_color-mix(in_oklab,currentColor_35%,transparent)]",
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      mood: "depressed",
      active: true,
      class: {
        face: "bg-stats-blue text-stats-foreground",
        faceIcon: "text-stats-foreground",
      },
    },
    {
      mood: "sad",
      active: true,
      class: {
        face: "bg-stats-purple text-stats-foreground",
        faceIcon: "text-stats-foreground",
      },
    },
    {
      mood: "neutral",
      active: true,
      class: {
        face: "bg-foreground text-background",
        faceIcon: "text-background",
      },
    },
    {
      mood: "happy",
      active: true,
      class: {
        face: "bg-success text-success-foreground",
        faceIcon: "text-success-foreground",
      },
    },
    {
      mood: "overjoyed",
      active: true,
      class: {
        face: "bg-accent text-accent-foreground shadow-[0_0_24px_color-mix(in_oklab,var(--accent)_40%,transparent)]",
        faceIcon: "text-accent-foreground",
      },
    },
  ],
  defaultVariants: {
    mood: "neutral",
    active: false,
  },
});
