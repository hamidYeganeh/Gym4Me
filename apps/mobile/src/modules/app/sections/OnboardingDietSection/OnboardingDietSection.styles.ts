import { tv } from "tailwind-variants";

export const onboardingDietSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center",
    grid: "grid w-full grid-cols-2 gap-3",
    card: [
      "flex h-auto min-h-[8.5rem] w-full min-w-0 flex-col items-start gap-3",
      "rounded-[1.35rem] border bg-default/50 px-4 py-4 text-start",
      "outline-none transition-[border-color,background-color,transform] duration-fast ease-app",
      "data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    icon: "size-7 shrink-0",
    title: "text-base font-bold leading-snug",
    description: "text-sm leading-5 text-muted",
    status: "flex min-h-40 w-full items-center justify-center",
    statusText: "text-center text-sm text-muted",
  },
  variants: {
    selected: {
      true: {
        card: "border-accent bg-accent/10",
        icon: "text-accent",
        title: "text-foreground",
      },
      false: {
        card: "border-transparent data-[hovered=true]:border-border",
        icon: "text-foreground",
        title: "text-foreground",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
