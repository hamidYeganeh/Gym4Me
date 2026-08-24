import { tv } from "tailwind-variants";

export const ownerClubsCreateCatalogSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5 rounded-[24px] bg-surface p-5",
    header: "flex items-start justify-between gap-4",
    title: "text-foreground",
    hint: "mt-1 text-muted",
    empty:
      "flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-secondary/40 text-sm font-semibold text-muted",
    selectedList: "flex flex-col gap-2",
    selectedItem:
      "flex min-h-18 items-center gap-3 rounded-2xl border border-border/70 bg-surface-secondary/45 p-3",
    iconBox:
      "flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent",
    itemCopy: "min-w-0 flex-1",
    itemMeta: "mt-0.5 line-clamp-2 text-muted",
    drawer: "max-h-[88dvh]",
    drawerBody: "flex min-h-0 flex-col gap-4 px-4",
    drawerFooter:
      "border-t border-border/70 bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3",
    optionList: "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-4",
    optionRow:
      "flex min-h-16 w-full items-center gap-3 rounded-2xl px-3 data-[hovered=true]:bg-surface-secondary",
    optionName: "min-w-0 flex-1 text-start font-semibold text-foreground",
    emptyResult: "py-12 text-center",
    editorBody: "flex flex-col gap-5 px-4 pb-6",
  },
});
