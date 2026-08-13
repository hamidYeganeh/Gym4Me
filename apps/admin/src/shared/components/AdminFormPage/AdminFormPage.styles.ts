import { tv } from "tailwind-variants";

export const adminFormPageVariants = tv({
  slots: {
    root: "mx-auto flex w-full max-w-3xl flex-col gap-6",
    header: "flex flex-col gap-2",
    title: "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
    description: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    body: "rounded-[1.5rem] border border-border bg-surface p-5 sm:p-8",
  },
});
