import { tv } from "tailwind-variants";

export const onboardingExperienceSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center justify-center",
    figure:
      "relative flex w-full max-w-xs items-end justify-center overflow-hidden rounded-[2rem] bg-foreground sm:max-w-sm",
    image: "h-auto w-full object-contain object-bottom",
  },
});
