import { tv } from "tailwind-variants";

export const clubsListHeaderSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
    copy: "min-w-0",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "mt-2 max-w-2xl text-sm leading-7 text-muted sm:text-base",
    actions: "flex shrink-0 flex-wrap items-center gap-3",
    badge: "text-xs text-warning",
  },
});
