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
    active: {
      true: {
        face: "scale-105 bg-accent text-accent-foreground shadow-[0_0_24px_color-mix(in_oklab,var(--accent)_40%,transparent)]",
        faceIcon: "text-accent-foreground",
      },
      false: {
        face: "bg-default text-muted",
        faceIcon: "text-muted",
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});
