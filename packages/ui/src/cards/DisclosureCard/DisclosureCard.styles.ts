import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const disclosureCardVariants = tv({
  slots: {
    root: "flex w-full",
    list: "flex w-full flex-col gap-2 will-change-transform",
    card: [
      "w-full overflow-hidden rounded-[1.25rem]",
      "border border-border/70 bg-surface-secondary/45",
    ].join(" "),
    cardInner: "p-2",
    collapsed: [
      "flex w-full cursor-pointer items-center gap-2 rounded-xl p-1",
      "text-start outline-none",
      "focus-visible:ring-2 focus-visible:ring-accent/50",
    ].join(" "),
    iconGrid: "grid shrink-0 grid-cols-2 gap-1",
    iconTileCollapsed: [
      "relative flex size-6 items-center justify-center rounded-full",
      "bg-accent p-1 text-accent-foreground",
    ].join(" "),
    iconTileMuted: "bg-accent/20 text-accent",
    meta: "ms-1 flex min-w-0 flex-1 flex-col items-start justify-center",
    title: "truncate text-lg text-foreground",
    titleExpanded: "flex-1 truncate text-lg text-foreground",
    subtitle: "text-sm text-muted",
    chevron: "size-6 shrink-0 text-muted",
    expanded: "flex w-full flex-col gap-3",
    expandedHeader: "flex items-center px-1",
    closeButton: [
      "flex size-8 items-center justify-center rounded-full bg-background",
      "text-muted transition-colors duration-fast ease-app",
      "hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    ].join(" "),
    rows: "flex flex-col gap-3",
    row: "flex items-center gap-2",
    rowInteractive: [
      "cursor-pointer rounded-xl p-1",
      "outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    ].join(" "),
    iconTileExpanded: [
      "flex size-10 shrink-0 items-center justify-center rounded-full",
      "bg-accent text-accent-foreground",
    ].join(" "),
    rowMeta: [
      "flex min-w-0 flex-1 flex-col items-start justify-center gap-1",
      "leading-none",
    ].join(" "),
    itemName: "text-base text-foreground",
    itemDetail: "text-sm text-muted",
    rowChevron: "me-1 size-6 shrink-0 text-muted",
    empty: "px-1 pb-1 text-sm text-muted",
  },
});

export type DisclosureCardVariantProps = VariantProps<
  typeof disclosureCardVariants
>;
