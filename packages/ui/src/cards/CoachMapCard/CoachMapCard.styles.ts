import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachMapCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full flex-col gap-4 overflow-hidden rounded-[28px]",
      "bg-surface p-5 text-surface-foreground",
    ].join(" "),
    row: "flex items-start gap-3.5",
    avatarWrap: "relative size-14 shrink-0 overflow-visible rounded-full",
    avatarFrame: "absolute inset-0 overflow-hidden rounded-full bg-default",
    avatar: "pointer-events-none size-full object-cover",
    verified: [
      "absolute -end-0.5 -bottom-0.5 z-[1] grid size-5 place-items-center",
      "rounded-full bg-success text-success-foreground",
      "ring-2 ring-surface",
    ].join(" "),
    verifiedIcon: "size-3.5",
    content: "flex min-w-0 flex-1 flex-col gap-1.5",
    title: "tracking-tight text-foreground",
    address: "text-sm leading-snug text-muted",
    meta: "flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground",
    metaItem: "inline-flex items-center gap-1",
    metaIcon: "size-3.5 shrink-0 text-muted",
    specialtyIcon: "size-3.5 shrink-0 text-danger",
    ratingRow: "flex items-center gap-1.5",
    stars: "flex items-center gap-0.5",
    star: "shrink-0 text-accent",
    starEmpty: "shrink-0 text-muted/35",
    ratingText: "text-sm text-foreground",
    ratingCount: "text-muted",
    chevron: "mt-1 size-4 shrink-0 text-muted",
    actions: "grid grid-cols-2 gap-2.5",
    directions: [
      "w-full justify-center rounded-2xl border-accent/45",
      "bg-accent/10 text-accent",
      "hover:bg-accent/15 data-[hovered=true]:bg-accent/15",
    ].join(" "),
    action: "w-full justify-center rounded-2xl",
  },
});

export type CoachMapCardVariantProps = VariantProps<
  typeof coachMapCardVariants
>;
