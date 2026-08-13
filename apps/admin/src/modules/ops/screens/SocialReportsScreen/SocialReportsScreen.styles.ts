import { tv } from "tailwind-variants";

export const socialReportsScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[1500px] flex-col gap-5",
    intro: "flex flex-col gap-2",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    actions: "flex flex-wrap gap-2",
    form: "flex flex-col gap-4",
    field: "flex flex-col gap-1.5",
  },
});
