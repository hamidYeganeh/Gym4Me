import { tv } from "tailwind-variants";

export const onboardingDietSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center",
    grid: "grid w-full grid-cols-2 gap-3",
    card: [
      "flex w-full min-w-0 flex-col items-start gap-3 border bg-default/50 text-start",
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
