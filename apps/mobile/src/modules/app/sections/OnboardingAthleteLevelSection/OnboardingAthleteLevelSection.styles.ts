import { tv } from "tailwind-variants";

export const onboardingAthleteLevelSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-6",
    badge: "rounded-full px-3 py-1 text-sm font-semibold",
    slider: "w-full",
    copy: "flex flex-col items-center gap-1.5 px-2 text-center",
    name: "text-xl font-bold text-foreground sm:text-2xl",
    description: "text-sm leading-6 text-muted",
    hint: "mt-2 flex items-center gap-2 text-sm text-muted",
    hintIcon: "size-5 shrink-0 text-muted",
    status: "flex min-h-40 w-full items-center justify-center",
    statusText: "text-center text-sm text-muted",
  },
});
