import { tv } from "tailwind-variants";

export const pointsLedgerFiltersSectionVariants = tv({
  slots: {
    root: "flex flex-wrap items-end gap-3",
    field: "flex w-full min-w-[12rem] flex-col gap-2 sm:w-48",
    label: "text-sm font-semibold text-foreground",
    input: [
      "h-12 w-full rounded-[var(--field-radius)] border border-border",
      "bg-field px-4 text-sm font-medium text-foreground",
    ].join(" "),
  },
});
