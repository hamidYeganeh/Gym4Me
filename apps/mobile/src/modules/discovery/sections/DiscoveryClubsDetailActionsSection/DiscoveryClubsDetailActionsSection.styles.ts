export const discoveryClubsDetailActionsSectionStyles = {
  root: [
    "pointer-events-none fixed inset-x-0 bottom-0 z-30",
    "bg-linear-to-t from-background via-background/95 to-transparent",
    "px-5 pt-10",
    "pb-[max(1rem,env(safe-area-inset-bottom))]",
  ].join(" "),
  row: [
    "pointer-events-auto mx-auto flex w-full max-w-lg items-center justify-between gap-4",
  ].join(" "),
  priceGroup:
    "flex min-w-0 flex-wrap items-baseline gap-1 text-foreground",
  pricePrefix: "text-xs font-normal text-muted",
  price: [
    "inline-block text-xl font-semibold leading-none text-foreground",
    "[font-variant-numeric:tabular-nums]",
  ].join(" "),
  priceSuffix: "text-xs font-normal text-muted",
  reserve: [
    "h-12 min-w-28 shrink-0 gap-2 rounded-2xl border-0 px-6 font-semibold",
    "bg-accent text-accent-foreground",
    "hover:opacity-90 pressed:opacity-85",
  ].join(" "),
} as const;
