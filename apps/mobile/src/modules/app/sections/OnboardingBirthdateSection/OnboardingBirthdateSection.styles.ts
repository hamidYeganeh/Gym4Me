import { tv } from "tailwind-variants";

export const onboardingBirthdateSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-6",
    calendar: "w-full max-w-none",
    ageRow: "flex items-center justify-center gap-2 text-foreground",
    ageIcon: "size-5 shrink-0 text-foreground",
    age: "text-sm font-semibold",
  },
});
