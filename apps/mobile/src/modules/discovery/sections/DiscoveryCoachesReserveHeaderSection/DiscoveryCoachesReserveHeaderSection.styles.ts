import { tv } from "tailwind-variants";

export const discoveryCoachesReserveHeaderSectionVariants = tv({
  slots: {
    coachRow: "flex items-center gap-3",
    avatar: "size-14 shrink-0",
    coachMeta: "flex min-w-0 flex-1 flex-col gap-0.5",
    coachName: "truncate text-foreground",
    coachSpecialty: "truncate text-muted",
    rating: "flex items-center gap-1",
    ratingValue: "text-foreground",
    ratingStar: "text-warning",
  },
});
