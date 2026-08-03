export const discoveryClubsDetailActionsSectionStyles = {
  root: [
    "pointer-events-none fixed inset-x-0 bottom-0 z-30 isolate",
    "overflow-hidden",
    "bg-linear-to-t from-background via-background/80 to-transparent",
    "px-5 pt-10",
    "pb-[max(0.85rem,env(safe-area-inset-bottom))]",
  ].join(" "),
  blur: "pointer-events-none absolute inset-0 z-0",
  row: [
    "pointer-events-auto relative z-10 mx-auto flex w-full max-w-lg",
    "items-center justify-between gap-4",
  ].join(" "),
  priceGroup: "flex min-w-0 flex-col gap-1",
  priceLabel: "text-muted",
  priceRow: "flex min-w-0 flex-wrap items-baseline gap-1 text-foreground",
  pricePrefix: "text-xs font-normal text-muted",
  price: [
    "inline-block text-xl font-semibold leading-none text-foreground",
    "[font-variant-numeric:tabular-nums]",
  ].join(" "),
  priceSuffix: "text-xs font-normal text-muted",
  confirm: ["min-w-0 h-14 w-1/2"].join(" "),
  confirmLabel: "truncate text-background",
  confirmIcon: "shrink-0 text-background",
} as const;
