import { tv } from "tailwind-variants";

export const discoveryCoachesReserveActionsSectionVariants = tv({
  slots: {
    footerRow: "flex items-center justify-between gap-3",
    priceGroup: "flex min-w-0 flex-col",
    priceLabel: "text-muted",
    priceRow: "flex items-baseline gap-1",
    price: "text-xl font-bold text-foreground",
    priceSuffix: "text-xs text-muted",
    confirm: "min-w-40 shrink-0",
    confirmLabel: "text-primary-foreground",
  },
});
