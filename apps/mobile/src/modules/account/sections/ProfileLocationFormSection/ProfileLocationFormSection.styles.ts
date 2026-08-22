import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileLocationFormSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    input: "min-w-0 flex-1 bg-transparent text-sm shadow-none",
    inputGroup: [
      "h-14 min-h-14 w-full rounded-2xl border border-border",
      "bg-transparent px-4 shadow-none",
    ].join(" "),
    icon: "shrink-0 text-muted",
    kinds: "grid w-full grid-cols-4 gap-2",
    kindButton: [
      "flex h-auto min-h-16 w-full flex-col items-center justify-center gap-1",
      "rounded-2xl border border-border bg-surface px-2 py-3 text-muted shadow-none",
      "data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
      "data-[selected=true]:text-accent",
    ].join(" "),
    hint: "text-xs leading-5 text-muted",
    mapWrap: "h-72 w-full overflow-hidden rounded-2xl",
    mapStatus: "text-sm text-muted",
    row: "grid grid-cols-2 gap-3",
    error: "text-danger",
    actions: "flex flex-col gap-3 pt-2",
    submit: "min-h-12 w-full rounded-2xl text-base font-bold",
    delete: "min-h-12 w-full rounded-2xl",
  },
});

export type ProfileLocationFormSectionVariants = VariantProps<
  typeof profileLocationFormSectionVariants
>;
