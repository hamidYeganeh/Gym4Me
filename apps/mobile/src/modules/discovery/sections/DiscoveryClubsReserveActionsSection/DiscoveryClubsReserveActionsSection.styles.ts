import { tv } from "tailwind-variants";

export const discoveryClubsReserveActionsSectionVariants = tv({
  slots: {
    footerRow: "items-center justify-between gap-4",
    priceGroup: "flex min-w-0 flex-col gap-1",
    priceLabel: "text-muted",
    priceRow: "flex min-w-0 flex-wrap items-baseline gap-1 text-foreground",
    pricePrefix: "text-xs font-normal text-muted",
    price: [
      "inline-block text-xl font-semibold leading-none text-foreground",
      "[font-variant-numeric:tabular-nums]",
    ].join(" "),
    priceSuffix: "text-xs font-normal text-muted",
    confirm: "min-w-0 w-1/2",
    confirmLabel: "truncate text-background",
    confirmIcon: "shrink-0 text-background",
    errorText: "w-full text-danger",
  },
});
