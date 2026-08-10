import { tv } from "tailwind-variants";

export const onboardingBirthdateSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-6",
    calendar: [
      "w-full max-w-none rounded-[1.5rem] border border-border/80",
      "bg-surface/80 p-4 text-foreground shadow-none backdrop-blur-md",
      "ring-1 ring-accent/10",
    ].join(" "),
    header: "px-0.5 pb-4",
    heading: "text-sm font-semibold text-foreground",
    navButton:
      "text-muted data-[hovered=true]:bg-default data-[hovered=true]:text-foreground",
    headerCell: "pb-2 text-xs font-medium text-muted",
    cell: [
      "rounded-full text-sm font-medium text-foreground",
      "data-[hovered=true]:bg-default",
      "data-[outside-month=true]:text-muted data-[outside-month=true]:opacity-45",
      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
      "data-[selected=true]:data-[hovered=true]:bg-accent",
      "data-[today=true]:bg-accent/20 data-[today=true]:text-accent",
      "data-[selected=true]:data-[today=true]:bg-accent",
      "data-[selected=true]:data-[today=true]:text-accent-foreground",
      "data-[selected=true]:data-[outside-month=true]:bg-default",
    ].join(" "),
    ageRow: "flex items-center justify-center gap-2 text-foreground",
    ageIcon: "size-5 shrink-0 text-foreground",
    age: "text-sm font-semibold",
  },
});
