import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubContactSectionVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-4 text-foreground",
    title: "min-w-0 text-foreground",
    list: "m-0 flex list-none flex-col gap-5 p-0",
    item: "flex items-center justify-between gap-4",
    text: "flex min-w-0 flex-1 flex-col gap-1 text-start",
    label: "text-base leading-snug text-foreground",
    number: [
      "text-xl font-bold leading-tight tracking-tight",
      "tabular-nums text-foreground",
    ].join(" "),
    callButton: [
      "size-12 shrink-0 rounded-full bg-surface-secondary text-foreground",
      "shadow-none",
      "[--button-bg:var(--surface-secondary)]",
      "[--button-bg-hover:color-mix(in_oklch,var(--surface-secondary)_88%,var(--foreground))]",
      "[--button-bg-pressed:color-mix(in_oklch,var(--surface-secondary)_80%,var(--foreground))]",
    ].join(" "),
    callIcon: "size-5 shrink-0 text-foreground/80",
  },
});

export type ClubContactSectionVariantProps = VariantProps<
  typeof clubContactSectionVariants
>;
