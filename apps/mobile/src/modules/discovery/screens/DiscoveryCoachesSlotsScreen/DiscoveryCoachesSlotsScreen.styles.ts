import { tv } from "tailwind-variants";

export const discoveryCoachesSlotsScreenVariants = tv({
  slots: {
    root: "relative min-h-dvh w-full bg-background",
    main: [
      "flex flex-col gap-6 px-5 pb-[calc(9.5rem+env(safe-area-inset-bottom))] pt-2",
    ].join(" "),
    calendarBadge: "absolute end-1.5 top-1.5 size-2 rounded-full bg-accent",
  },
});
