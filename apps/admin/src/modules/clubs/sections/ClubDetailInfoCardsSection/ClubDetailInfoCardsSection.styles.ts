import { tv } from "tailwind-variants";

export const clubDetailInfoCardsSectionVariants = tv({
  slots: {
    card: "rounded-2xl border border-border bg-surface p-5",
    cardTitle: "mb-3 text-base font-semibold text-foreground",
    grid: "grid gap-3 text-sm sm:grid-cols-2",
    label: "text-muted",
    value: "font-medium text-foreground",
    chips: "flex flex-wrap gap-1.5",
    muted: "text-sm text-muted",
  },
});
