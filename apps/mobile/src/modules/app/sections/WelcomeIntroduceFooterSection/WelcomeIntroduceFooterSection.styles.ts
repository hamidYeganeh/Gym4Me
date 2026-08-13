import { tv } from "tailwind-variants";

export const welcomeIntroduceFooterSectionVariants = tv({
  slots: {
    root: [
      "shrink-0 px-4 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
      "bg-transparent",
      "dark:bg-transparent",
    ],
    row: "flex items-center justify-between gap-4",
    navButton: [
      "size-16 shrink-0 rounded-full border-0",
      "bg-foreground text-background",
      "dark:bg-white dark:text-zinc-900",
      "shadow-none transition-transform duration-fast ease-app",
      "data-[hovered=true]:opacity-90 data-[pressed=true]:scale-95",
      "[&_svg]:size-6",
    ],
    dots: "relative flex h-3 max-w-[12rem] flex-wrap items-center justify-center gap-1.5",
    dot: "relative size-1.5 shrink-0 rounded-full bg-default dark:bg-zinc-600",
    dotActive: "relative h-1.5 w-5 shrink-0 rounded-full bg-accent",
  },
});
