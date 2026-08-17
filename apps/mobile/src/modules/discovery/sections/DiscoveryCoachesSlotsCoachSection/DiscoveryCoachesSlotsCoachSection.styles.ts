import { tv } from "tailwind-variants";

export const discoveryCoachesSlotsCoachSectionVariants = tv({
  slots: {
    root: "flex items-center gap-3",
    avatar: "size-12 shrink-0",
    meta: "flex min-w-0 flex-1 flex-col gap-0.5",
    name: "truncate text-base leading-tight tracking-tight text-foreground",
    specialty: "truncate text-sm leading-snug text-muted",
    rating: "flex shrink-0 items-center gap-1 text-foreground",
    ratingValue: "text-sm font-semibold tabular-nums leading-none",
    ratingStar: "shrink-0 text-warning",
  },
});
