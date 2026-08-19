import { tv } from "tailwind-variants";

export const onboardingWeightSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-6",
    unitTrack: "grid w-full grid-cols-2 gap-1 rounded-full bg-default p-1",
    unitItem:
      "flex h-10 w-full min-w-0 items-center justify-center rounded-full text-sm font-semibold outline-none transition-[background-color,color,box-shadow] duration-fast ease-app",
    valueRow: "flex items-end justify-center gap-2",
    value: "text-5xl font-bold tabular-nums leading-none text-foreground",
    unit: "pb-1 text-base font-semibold text-muted",
    slider: "w-full border-0 bg-transparent shadow-none",
  },
  variants: {
    selected: {
      true: {
        unitItem: "bg-background text-foreground shadow-sm",
      },
      false: {
        unitItem: "bg-transparent text-muted data-[hovered=true]:text-foreground",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
