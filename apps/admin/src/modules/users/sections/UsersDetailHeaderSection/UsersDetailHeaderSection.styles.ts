import { tv } from "tailwind-variants";

export const usersDetailHeaderSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
    copy: "min-w-0",
    backRow: "mb-3",
    title: "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
    subtitle: "mt-2 text-sm leading-7 text-muted sm:text-base",
    meta: "mt-3 flex flex-wrap gap-2",
    actions: "flex shrink-0 flex-wrap items-center gap-3",
  },
});
