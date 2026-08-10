import { tv } from "tailwind-variants";

export const onboardingSleepSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-4",
    label: "text-base font-semibold text-foreground",
    track:
      "grid w-full grid-cols-5 gap-1 rounded-full bg-default p-1.5",
    item: "flex h-11 items-center justify-center rounded-full text-base font-semibold outline-none transition-[background-color,color] duration-fast ease-app",
    description: "text-center text-sm leading-6 text-muted",
  },
  variants: {
    selected: {
      true: {
        item: "bg-background text-foreground shadow-sm",
      },
      false: {
        item: "bg-transparent text-muted data-[hovered=true]:text-foreground",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
