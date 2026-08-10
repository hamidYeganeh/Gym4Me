import { tv } from "tailwind-variants";

export const onboardingMoodSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-lg flex-col items-center gap-6",
    stage: "relative flex w-full flex-col items-center py-6",
    pointer:
      "absolute top-2 z-20 size-0 border-x-8 border-x-transparent border-t-[10px] border-t-foreground",
    glow: "pointer-events-none absolute inset-x-1/4 top-8 bottom-8 rounded-full bg-accent/15 blur-3xl",
    rings:
      "pointer-events-none absolute inset-x-[12%] top-10 bottom-10 rounded-full border border-accent/20",
    ringsInner:
      "pointer-events-none absolute inset-x-[22%] top-16 bottom-16 rounded-full border border-accent/10",
    carousel: "relative z-10 w-full overflow-hidden",
    track: "flex touch-pan-y items-center",
    slide:
      "flex min-w-0 shrink-0 grow-0 basis-[34%] items-center justify-center px-2 sm:basis-[28%]",
    face: "flex size-[5.5rem] items-center justify-center rounded-[1.5rem] transition-[background-color,box-shadow,transform,color] duration-fast ease-app sm:size-24",
    faceIcon: "size-10 sm:size-12",
    statement: "text-center text-base font-semibold text-foreground",
  },
  variants: {
    active: {
      true: {
        face: "scale-110 bg-accent text-accent-foreground shadow-[0_0_28px_color-mix(in_oklab,var(--accent)_45%,transparent)]",
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
