import { tv } from "tailwind-variants";

export const onboardingHeightSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-8",
    unitTrack: "grid w-36 grid-cols-2 gap-1 rounded-full bg-default p-1",
    unitItem:
      "flex h-9 items-center justify-center rounded-full text-sm font-semibold outline-none transition-[background-color,color] duration-fast ease-app",
    slider: "w-full max-w-[10rem]",
  },
  variants: {
    selected: {
      true: {
        unitItem: "bg-background text-foreground",
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
