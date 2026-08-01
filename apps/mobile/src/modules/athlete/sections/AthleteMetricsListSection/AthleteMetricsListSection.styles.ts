export const athleteMetricsListSectionStyles = {
  root: "flex flex-col gap-3",
  header: "flex items-center justify-between gap-3",
  title: "text-foreground",
  viewButton: [
    "inline-flex h-auto min-h-0 items-center gap-1.5 rounded-md !px-0 !py-0",
    "text-sm font-semibold text-warning shadow-none",
    "hover:bg-transparent hover:opacity-90",
    "pressed:bg-transparent data-[pressed=true]:bg-transparent",
  ].join(" "),
  viewIcon: "size-4 shrink-0 text-current",
  chevron: "size-3.5 shrink-0 text-current",
  list: "flex flex-col gap-3",
} as const;
