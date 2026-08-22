import { tv } from "tailwind-variants";

export const onboardingGoalsSectionVariants = tv({
  slots: {
    root: "flex h-full min-h-0 w-full flex-col",
    scroller: "h-full min-h-0 w-full",
    list: "flex w-full flex-col gap-3 pb-2",
    status: "flex min-h-40 w-full items-center justify-center",
    statusText: "text-center text-sm text-muted",
    option: [
      "flex w-full items-center gap-3 rounded-2xl border p-4",
      "outline-none transition-[border-color,background-color,transform] duration-fast ease-app",
      "data-[pressed=true]:scale-[0.99] min-h-14",
    ].join(" "),
    optionIcon: "size-6 shrink-0",
    optionLabel: "min-w-0 flex-1 text-start text-sm font-semibold leading-5",
    check: [
      "flex size-6 shrink-0 items-center justify-center rounded-md border",
      "transition-[background-color,border-color] duration-fast ease-app",
    ].join(" "),
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
        option:
          "border-border bg-transparent text-foreground data-[hovered=true]:bg-default/40",
        optionIcon: "text-muted",
        check: "border-border bg-transparent",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
