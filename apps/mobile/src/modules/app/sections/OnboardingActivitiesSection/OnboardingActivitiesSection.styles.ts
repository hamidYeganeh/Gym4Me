import { tv } from "tailwind-variants";

export const onboardingActivitiesSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center",
    grid: "grid w-full grid-cols-3 gap-x-3 gap-y-5",
    card: "flex flex-col items-center gap-2.5 bg-transparent outline-none transition-[color,transform] duration-fast ease-app data-[pressed=true]:scale-[0.97]",
    iconWrap:
      "flex size-[4.25rem] items-center justify-center rounded-full border transition-[border-color,background-color,color] duration-fast ease-app",
    icon: "size-8",
    label: "text-center text-xs font-medium leading-4",
  },
  variants: {
    selected: {
      true: {
        iconWrap: "border-accent bg-accent/10 text-foreground",
        label: "text-accent",
      },
      false: {
        iconWrap: "border-border bg-transparent text-foreground",
        label: "text-foreground",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
