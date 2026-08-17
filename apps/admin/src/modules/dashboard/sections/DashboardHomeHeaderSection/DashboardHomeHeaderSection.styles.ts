import { tv } from "tailwind-variants";

export const dashboardHomeHeaderSectionVariants = tv({
  slots: {
    intro: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
    introCopy: "min-w-0",
    title: "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "mt-2 max-w-2xl text-sm leading-7 text-muted sm:text-base",
    introActions: "flex shrink-0 items-center gap-3",
  },
});
