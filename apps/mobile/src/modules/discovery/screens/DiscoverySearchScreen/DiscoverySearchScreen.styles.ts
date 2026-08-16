export const discoverySearchScreenStyles = {
  root: "bg-background",
  headerSpacer:
    "pointer-events-none shrink-0 h-[calc(7.5rem+env(safe-area-inset-top))]",
  header: [
    "fixed top-0 left-1/2 z-40 w-full max-w-xl -translate-x-1/2",
    "overflow-hidden rounded-b-[2.5rem] bg-surface",
    "pt-[env(safe-area-inset-top)]",
  ].join(" "),
  headerInner: "flex flex-col gap-3 px-screen pb-4 pt-3",
  toolbar: "flex items-center gap-2",
  searchField: "min-w-0 flex-1",
  searchGroup: [
    "h-11 rounded-2xl border border-border bg-transparent",
    "shadow-none",
  ].join(" "),
  iconButton: "shrink-0 rounded-[0.875rem] text-foreground",
  locationButton: [
    "h-12 w-full justify-start gap-3 rounded-2xl border border-border",
    "bg-transparent px-3.5 text-start shadow-none",
    "hover:bg-default/40 data-[hovered=true]:bg-default/40",
  ].join(" "),
  locationPin: "shrink-0 text-warning",
  locationLabel: "min-w-0 flex-1 truncate text-sm font-medium text-foreground",
  locationChevron: "shrink-0 text-muted",
  content: "flex flex-col gap-5 pb-12 pt-2",
  sectionTitle: "text-foreground",
  historyList: "flex flex-col",
  historyItem: [
    "flex h-auto w-full items-center gap-3 rounded-none",
    "border-b border-border bg-transparent px-0 py-3.5",
    "text-start shadow-none",
    "hover:bg-transparent data-[hovered=true]:bg-transparent",
  ].join(" "),
  historyIcon: "shrink-0 text-muted",
  historyQuery: "min-w-0 flex-1 truncate text-base text-foreground",
  historyAction: "shrink-0 text-muted",
  empty: "py-6 text-muted",
} as const;
