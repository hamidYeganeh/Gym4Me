export const discoveryCoachesDetailActionsSectionStyles = {
  row: "h-[78px] items-center justify-between gap-3 p-3",
  priceGroup: "flex min-w-0 flex-col gap-0.5",
  priceRow: "flex min-w-0 flex-wrap items-baseline gap-1 text-foreground",
  pricePrefix: "text-xs font-normal text-muted",
  price: [
    "inline-block text-xl font-bold leading-none text-foreground",
    "[font-variant-numeric:tabular-nums]",
  ].join(" "),
  priceSuffix: "text-xs font-normal text-muted",
  priceLabel: "text-muted",
  confirm: "min-w-0 h-full shrink-0 px-5",
  confirmLabel: "truncate text-accent-foreground",
  confirmIcon: "shrink-0 text-accent-foreground",
} as const;
