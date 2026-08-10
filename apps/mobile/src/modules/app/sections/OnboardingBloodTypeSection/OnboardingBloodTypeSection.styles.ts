import { tv } from "tailwind-variants";

export const onboardingBloodTypeSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-10",
    groupTrack: "grid w-full grid-cols-4 gap-1 rounded-full bg-default p-1.5",
    groupItem:
      "flex h-11 items-center justify-center rounded-full text-base font-semibold outline-none transition-[background-color,color] duration-fast ease-app",
    preview: "relative flex items-center justify-center",
    letter: "text-[6.5rem] font-bold leading-none text-foreground",
    rhBadge:
      "absolute -start-2 top-3 flex size-8 items-center justify-center rounded-full bg-danger text-sm font-bold text-danger-foreground",
    rhRow: "grid w-full max-w-xs grid-cols-2 gap-4",
    rhItem:
      "flex h-16 items-center justify-center rounded-[1.25rem] border-2 outline-none transition-[border-color,background-color,color] duration-fast ease-app",
    rhIcon: "size-7",
  },
  variants: {
    selected: {
      true: {
        groupItem: "bg-background text-foreground shadow-sm",
        rhItem: "border-accent bg-accent/10 text-accent",
        rhIcon: "text-accent",
      },
      false: {
        groupItem: "bg-transparent text-muted data-[hovered=true]:text-foreground",
        rhItem: "border-border bg-transparent text-muted data-[hovered=true]:border-muted",
        rhIcon: "text-muted",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
