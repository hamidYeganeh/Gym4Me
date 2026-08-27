import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileLocationFormSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    input:
      "h-[var(--field-height)] min-h-[var(--field-height)] min-w-0 flex-1 bg-transparent text-sm shadow-none",
    kinds: "flex flex-wrap gap-2",
    kindChipButton: [
      "h-auto min-h-0 p-0 shadow-none",
      "hover:bg-transparent data-[hovered=true]:bg-transparent",
      "data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    kindChip: "h-11 gap-1.5 rounded-[var(--field-radius)] px-3.5",
    hint: "text-xs leading-5 text-muted",
    mapWrap:
      "h-72 w-full overflow-hidden rounded-[var(--field-radius)] border border-border",
    error: "text-sm text-danger",
    actions: "flex flex-col gap-3 pt-2",
    submit: "h-14 min-h-14 w-full rounded-2xl text-base font-bold",
    delete: "h-14 min-h-14 w-full rounded-2xl",
  },
});

export type ProfileLocationFormSectionVariants = VariantProps<
  typeof profileLocationFormSectionVariants
>;
