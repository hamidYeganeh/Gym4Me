import { tv } from "tailwind-variants";

export const welcomeIntroduceFooterSectionVariants = tv({
  slots: {
    root: [
      "shrink-0 bg-transparent text-foreground",
      "px-screen pt-8 pb-[max(1.75rem,env(safe-area-inset-bottom))]",
    ],
    row: "flex items-center justify-between gap-6",
    navButton: [
      "size-14 shrink-0 rounded-full border-0 bg-foreground text-background",
      "shadow-none transition-transform duration-fast ease-app",
      "data-[hovered=true]:opacity-90 data-[pressed=true]:scale-95",
      "[&_svg]:size-6",
    ],
    dots: "relative flex h-3 items-center justify-center gap-1.5",
    dot: "relative size-1.5 rounded-full bg-background-inverse",

    dotActive: "relative h-1.5 w-5 rounded-full bg-accent",
  },
});
