import { tv } from "tailwind-variants";

export const discoveryLocationSheetVariants = tv({
  slots: {
    dialog: [
      "mx-auto w-full max-w-xl gap-0",
      "rounded-t-[2rem] border-0 bg-background px-0",
      "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
    ].join(" "),
    header: "flex flex-col gap-2 px-screen pb-1 pt-1",
    heading: "text-start text-foreground",
    description: "text-start text-muted",
    close: "text-foreground",
    body: "flex flex-col gap-5 px-screen pt-3",
    list: "flex flex-col gap-3",
    item: [
      "flex h-auto min-h-[4.5rem] w-full items-center justify-start gap-3.5",
      "rounded-2xl border border-border/80 bg-surface px-4 py-3.5 text-start",
      "shadow-none transition-[border-color,background-color] duration-fast",
      "hover:bg-surface data-[hovered=true]:bg-surface",
      "pressed:scale-[0.99] data-[pressed=true]:scale-[0.99]",
    ].join(" "),
    itemIcon: "shrink-0 text-foreground",
    itemCopy: "min-w-0 flex-1",
    itemLabel: "text-foreground",
    itemLine: "mt-0.5 text-foreground/80",
    itemCheck: [
      "flex size-6 shrink-0 items-center justify-center rounded-[0.375rem]",
      "border-2 border-border bg-transparent text-accent-foreground",
    ].join(" "),
    empty: "py-6 text-center text-muted",
    addRow: "flex justify-center pt-1",
    addButton: [
      "h-auto min-h-0 gap-1.5 px-2 py-1",
      "text-accent shadow-none",
      "data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80",
    ].join(" "),
    addLabel: "font-semibold text-accent",
    footer: "px-screen pt-3",
    updateButton: "h-14 w-full gap-2 rounded-full text-base font-semibold",
  },
  variants: {
    selected: {
      true: {
        item: [
          "border-accent bg-accent/15",
          "hover:bg-accent/15 data-[hovered=true]:bg-accent/15",
        ].join(" "),
        itemCheck: "border-accent bg-accent",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
