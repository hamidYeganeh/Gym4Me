import { tv } from "tailwind-variants";

export const jalaliCalendarVariants = tv({
  slots: {
    root: "w-full max-w-none",
    calendar: [
      "w-full max-w-none rounded-2xl border border-border/80 bg-surface p-3",
      "shadow-none",
    ].join(" "),
    monthsStack: "flex w-full flex-col gap-6",
    monthBlock: "w-full",
    monthHeader: "px-0.5 pb-3",
    monthHeading: "flex-none text-sm font-semibold text-foreground",
    navSpacer: "size-6 shrink-0",
  },
});
