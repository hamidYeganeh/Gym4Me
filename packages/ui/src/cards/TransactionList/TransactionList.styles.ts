import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const transactionListVariants = tv({
  slots: {
    root: [
      "flex w-full items-center justify-center overflow-hidden rounded-2xl",
      "border border-border bg-surface shadow-sm",
    ].join(" "),
    inner: "w-full p-3",
    list: "flex w-full flex-col gap-2",
    heading: "font-medium text-muted",
    item: [
      "flex w-full cursor-pointer gap-2 rounded-lg text-start",
      "outline-none transition-colors duration-fast ease-app",
      "hover:bg-surface-secondary/60 focus-visible:ring-2 focus-visible:ring-accent",
    ].join(" "),
    iconTile: [
      "flex size-10 shrink-0 items-center justify-center rounded-full",
      "bg-foreground text-background",
    ].join(" "),
    iconTileExpanded: [
      "flex size-10 items-center justify-center rounded-lg",
      "bg-foreground text-background",
    ].join(" "),
    itemBody: "flex flex-1 flex-col justify-center text-xs",
    name: "font-semibold text-foreground",
    category: "text-muted",
    amount: "flex items-center text-xs text-muted",
    amountExpanded: "text-foreground",
    footer: [
      "flex items-center justify-center gap-1 rounded-sm py-1",
      "text-foreground outline-none transition-colors duration-fast ease-app",
      "hover:text-accent focus-visible:ring-2 focus-visible:ring-accent",
    ].join(" "),
    footerLabel: "text-sm",
    footerIcon: "size-3.5 shrink-0",
    expanded: "flex w-full flex-col gap-2",
    expandedHeader: "flex justify-between",
    closeButton: [
      "flex cursor-pointer items-center justify-center self-start rounded-full",
      "bg-surface-secondary p-2 text-foreground",
      "outline-none transition-colors duration-fast ease-app",
      "hover:bg-surface-tertiary focus-visible:ring-2 focus-visible:ring-accent",
    ].join(" "),
    closeIcon: "size-4",
    expandedMeta: "flex justify-between",
    categoryExpanded: "text-sm text-muted",
    details: "flex flex-col gap-2 text-xs text-muted",
    divider: "border border-dashed border-border",
    cardType: "font-bold uppercase italic text-foreground",
  },
});

export type TransactionListVariantProps = VariantProps<
  typeof transactionListVariants
>;
