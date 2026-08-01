import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachMapCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full flex-col gap-4 overflow-hidden rounded-[28px]",
      "bg-surface p-5 text-surface-foreground shadow-[var(--overlay-shadow)]",
    ].join(" "),
    row: "flex items-start gap-3.5",
    avatarWrap: "relative size-14 shrink-0 overflow-hidden rounded-full bg-default",
    avatar: "pointer-events-none absolute inset-0 size-full object-cover",
    content: "flex min-w-0 flex-1 flex-col gap-1.5",
    title: "tracking-tight text-foreground",
    meta: "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted",
    specialty: "inline-flex items-center gap-1 text-foreground",
    specialtyIcon: "size-3.5 shrink-0 text-danger",
    metaDot: "size-1 shrink-0 rounded-full bg-muted",
    rating: "inline-flex items-center gap-1",
    star: "size-3.5 shrink-0 text-warning",
    ratingText: "text-muted",
    address: "text-sm leading-snug text-muted",
    directions: [
      "inline-flex h-auto min-h-0 items-center gap-1.5 p-0",
      "text-sm font-medium text-accent",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
    ].join(" "),
    directionsIcon: "size-3.5 shrink-0 text-accent",
    action: "w-full justify-center gap-2 rounded-2xl",
    actionIcon: "size-4 shrink-0",
  },
});

export type CoachMapCardVariantProps = VariantProps<
  typeof coachMapCardVariants
>;
