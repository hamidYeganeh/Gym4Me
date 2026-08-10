import { tv } from "tailwind-variants";

export const onboardingPhaseIntroSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-8",
    stepper: "w-full px-2",
    sheet:
      "flex w-full flex-col items-center overflow-hidden rounded-t-[2rem] bg-surface text-surface-foreground px-4 pt-6 pb-2",
    figure:
      "relative flex w-full max-w-sm items-end justify-center overflow-hidden",
    image: "h-auto w-full object-contain object-bottom",
    copy: "flex flex-col items-center gap-3 px-2 pt-2 text-center",
    title:
      "text-balance text-[1.55rem] leading-tight font-bold text-surface-foreground sm:text-[1.75rem]",
    subtitle: "text-pretty text-base leading-7 text-muted",
  },
});
