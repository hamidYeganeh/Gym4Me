import { tv } from "tailwind-variants";

export const coachBookingsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    tabs: "-mx-screen flex gap-2.5 overflow-x-auto px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    tabChip: "shrink-0 rounded-full",
    error: "flex items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-danger",
  },
});
