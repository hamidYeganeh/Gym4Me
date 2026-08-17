import { tv } from "tailwind-variants";

export const payoutsListHeaderSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    actions: "flex flex-wrap gap-2",
  },
});
