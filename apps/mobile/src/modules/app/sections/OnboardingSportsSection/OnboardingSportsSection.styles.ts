import { tv } from "tailwind-variants";

export const onboardingSportsSectionVariants = tv({
  slots: {
    root: "flex w-full flex-col",
    grid: "grid w-full grid-cols-3 gap-3 [&>*]:min-w-0 [&>*]:!w-full",
    status: "flex min-h-40 w-full items-center justify-center",
    statusText: "text-center text-sm text-muted",
  },
});
