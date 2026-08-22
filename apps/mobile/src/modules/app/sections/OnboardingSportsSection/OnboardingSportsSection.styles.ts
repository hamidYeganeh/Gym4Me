import { tv } from "tailwind-variants";

export const onboardingSportsSectionVariants = tv({
  slots: {
    root: "flex h-full min-h-0 w-full max-w-md flex-col items-center",
    scroller: "h-full min-h-0 w-full",
    grid: "grid w-full grid-cols-3 gap-3 pb-2",
    status: "flex min-h-40 w-full items-center justify-center",
    statusText: "text-center text-sm text-muted",
  },
});
