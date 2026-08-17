import { tv } from "tailwind-variants";

export const coachSlotsManageWeekNavSectionVariants = tv({
  slots: {
    root: "flex items-center justify-between gap-3",
    label: "text-foreground",
    nav: "flex items-center gap-2",
    button: "size-10 min-w-10 rounded-full bg-default p-0",
    buttonIcon: "text-foreground",
  },
});
