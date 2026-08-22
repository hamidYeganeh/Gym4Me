import { tv } from "tailwind-variants";

export const onboardingFooterSectionVariants = tv({
  slots: {
    root: "shrink-0 pt-3",
    stack: "flex w-full flex-col items-center gap-3",
    continue:
      "min-h-14 w-full rounded-[1.35rem] text-base font-bold text-accent-foreground",
    continueSoft:
      "min-h-14 w-full rounded-[1.35rem] bg-default text-base font-bold text-muted opacity-100",
    continueIcon: "ms-2 size-5",
    secondaryAction:
      "text-sm font-bold text-accent outline-none data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80",
  },
});
