import { tv } from "tailwind-variants";

export const onboardingBodyTypeSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-lg flex-col items-center gap-5",
    grid: "flex w-full items-end justify-center gap-3 sm:gap-4",
    card: "!h-[280px] !w-[104px] sm:!h-[320px] sm:!w-[120px]",
    statement: "text-center text-lg font-bold text-foreground",
  },
});
