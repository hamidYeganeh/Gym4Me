import { tv } from "tailwind-variants";

export const onboardingGoalsSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col",
    list: "flex w-full flex-col gap-3",
    option:
      "flex min-h-14 w-full items-center gap-3 rounded-full border px-4 py-3 outline-none transition-[border-color,background-color,transform] duration-fast ease-app data-[pressed=true]:scale-[0.99]",
    optionIcon: "size-6 shrink-0",
    optionLabel: "min-w-0 flex-1 text-start text-sm font-semibold leading-5",
    check:
      "flex size-6 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-fast ease-app",
    checkIcon: "size-3.5",
  },
  variants: {
    selected: {
      true: {
        option: "border-accent bg-accent/10 text-foreground",
        optionIcon: "text-foreground",
        check: "border-accent bg-accent text-accent-foreground",
        checkIcon: "text-accent-foreground",
      },
      false: {
        option: "border-border bg-transparent text-foreground data-[hovered=true]:bg-default/40",
        optionIcon: "text-muted",
        check: "border-border bg-transparent",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
