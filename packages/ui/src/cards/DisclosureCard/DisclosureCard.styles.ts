import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const disclosureCardVariants = tv({
  slots: {
    root: "flex w-full",
    list: "flex w-full flex-col gap-2 will-change-transform",
    card: [
      "w-full cursor-pointer overflow-hidden rounded-[1.25rem]",
      "border border-border bg-surface",
    ].join(" "),
    cardInner: "p-2",
    collapsed: "flex w-full items-center gap-2",
    iconGrid: "grid grid-cols-2 gap-1",
    iconTileCollapsed: [
      "relative flex size-6 items-center justify-center rounded-full",
      "bg-accent p-1 text-accent-foreground",
    ].join(" "),
    meta: "ms-2 flex min-w-0 flex-1 flex-col items-start justify-center",
    title: "truncate text-lg text-foreground",
    titleExpanded: "flex-1 truncate text-lg text-foreground",
    subtitle: "text-sm text-muted",
    chevron: "size-6 shrink-0 text-muted",
    expanded: "flex w-full flex-col gap-3",
    expandedHeader: "flex items-center px-1",
    closeButton: [
      "flex items-center justify-center rounded-full bg-surface-secondary p-1",
      "text-muted transition-colors duration-fast ease-app",
      "hover:text-foreground",
    ].join(" "),
    rows: "flex flex-col gap-3",
    row: "flex items-center justify-center gap-2",
    iconTileExpanded: [
      "flex size-10 items-center justify-center rounded-full",
      "bg-accent text-accent-foreground",
    ].join(" "),
    rowMeta: [
      "mt-0.5 flex min-w-0 flex-1 flex-col items-start justify-center gap-1",
      "leading-none",
    ].join(" "),
    itemName: "text-base text-foreground",
    itemPrice: "text-sm text-muted",
    rowChevron: "me-1 size-6 shrink-0 text-muted",
  },
});

export type DisclosureCardVariantProps = VariantProps<
  typeof disclosureCardVariants
>;
