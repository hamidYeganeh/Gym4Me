import { tv } from "tailwind-variants";

export const jalaliCalendarVariants = tv({
  slots: {
    root: "w-full max-w-none [&_.rmdp-wrapper]:w-full",
    calendar: "rmdp-mobile gym4me",
  },
});
