import { tv } from "tailwind-variants";

export const unitsMetricCardVariants = tv({
  slots: {
    root: "w-full",
    trigger: [
      "flex h-auto min-h-0 w-full flex-col items-start gap-3",
      "rounded-[24px] border border-border bg-surface p-4",
      "shadow-none",
    ].join(" "),
    icon: "text-foreground",
    label: "text-start text-base font-bold leading-none text-foreground",
    value: "text-start text-muted",
  },
  variants: {
    isDisabled: {
      true: {
        trigger: "cursor-not-allowed opacity-50",
        label: "text-muted",
      },
    },
  },
});
