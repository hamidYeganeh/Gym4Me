import { tv } from "tailwind-variants";

export const coachClientDetailHeroSectionVariants = tv({
  slots: {
    root: "flex flex-col items-center gap-3 text-center",
    avatar: "size-24 rounded-full object-cover",
    name: "tracking-tight text-foreground",
    meta: "text-muted",
    chips: "flex items-center gap-2",
  },
});
