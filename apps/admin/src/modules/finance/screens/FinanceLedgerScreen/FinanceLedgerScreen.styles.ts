import { tv } from "tailwind-variants";

export const financeLedgerScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[1500px] flex-col gap-5",
    intro: "flex flex-col gap-2",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    actions: "flex flex-wrap gap-2",
    filters: "flex flex-wrap items-end gap-3",
    field: "flex w-full min-w-[12rem] flex-col gap-2 sm:w-48",
    label: "text-sm font-semibold text-foreground",
    input: [
      "h-12 w-full rounded-[var(--field-radius)] border border-border",
      "bg-field px-4 text-sm font-medium text-foreground",
    ].join(" "),
  },
});
