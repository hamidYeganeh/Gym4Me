import { tv } from "tailwind-variants";

export const multiSelectFilterVariants = tv({
  slots: {
    root: "w-full min-w-48 sm:w-56",
    label: "text-xs font-medium text-muted",
    trigger: "min-h-10 rounded-xl",
    value: "truncate",
    indicator: "text-muted",
    popover: "min-w-56",
    listBox: "max-h-72",
    item: "text-sm",
  },
});
