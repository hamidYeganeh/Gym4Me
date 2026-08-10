import { tv } from "tailwind-variants";

export const onboardingGenderSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-6",
    grid: "grid w-full grid-cols-3 gap-4 px-1",
    option: "flex flex-col items-center gap-3 outline-none",
    pill: "flex h-14 w-full items-center justify-center rounded-full border-2 bg-transparent transition-[border-color,color,background-color,transform] duration-fast ease-app data-[pressed=true]:scale-[0.98]",
    icon: "size-7",
    label: "text-sm font-semibold",
    field: "w-full",
    textarea:
      "min-h-28 resize-y rounded-[1.35rem] border border-border bg-transparent px-4 py-3 text-sm leading-6 text-foreground shadow-none transition-[border-color] duration-fast ease-app placeholder:text-muted data-[focus-visible=true]:border-accent",
    counter: "mt-1 text-start text-xs text-muted tabular-nums",
  },
  variants: {
    selected: {
      true: {
        pill: "border-accent text-accent",
        icon: "text-accent",
        label: "text-accent",
      },
      false: {
        pill: "border-border text-muted data-[hovered=true]:border-muted",
        icon: "text-muted",
        label: "text-foreground",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
