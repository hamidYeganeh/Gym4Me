import { tv } from "tailwind-variants";

export const unitsChoiceSheetVariants = tv({
  slots: {
    group: "flex w-full flex-col gap-2",
    radio: "w-full",
    row: [
      "flex h-14 w-full items-center gap-3 rounded-2xl border px-4",
      "text-start shadow-none",
    ].join(" "),
    icon: "shrink-0 text-foreground",
    label: "min-w-0 flex-1 font-semibold text-foreground",
    control: "ms-auto shrink-0",
    error: "text-sm text-danger",
  },
  variants: {
    selected: {
      true: {
        row: "border-accent bg-accent/10",
      },
      false: {
        row: "border-border bg-background",
      },
    },
    disabled: {
      true: {
        row: "cursor-not-allowed opacity-50",
        label: "text-muted",
      },
    },
  },
});
