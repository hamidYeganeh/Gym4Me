import { tv } from "tailwind-variants";

export const onboardingSlideShellVariants = tv({
  slots: {
    root: "flex h-full min-h-0 w-full flex-col bg-transparent",
    stack: "flex min-h-0 flex-1 flex-col",
    copy: "flex shrink-0 flex-col items-center gap-2 px-1 pt-2 text-center",
    title:
      "max-w-[22ch] text-balance text-[1.65rem] leading-tight font-bold tracking-tight text-foreground sm:max-w-[26ch] sm:text-[1.85rem]",
    subtitle:
      "max-w-[34ch] text-pretty text-[0.95rem] leading-relaxed text-muted",
    stage: "relative flex min-h-0 flex-1",
  },
  variants: {
    bleed: {
      true: {
        root: "overflow-hidden",
        copy: "px-5 pt-[calc(3.5rem+env(safe-area-inset-top))]",
        stage: "items-stretch",
      },
      false: {
        root: [
          "overflow-x-hidden overflow-y-auto",
          "px-5 pt-[calc(3.5rem+env(safe-area-inset-top))]",
          "pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
        ],
        stage: "items-center justify-center overflow-visible py-4",
      },
    },
  },
  defaultVariants: {
    bleed: false,
  },
});
