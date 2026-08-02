import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachNearbyCardVariants = tv({
  slots: {
    root: [
      "flex h-auto w-full items-start gap-3 rounded-[22px] border border-border",
      "bg-surface px-3.5 py-3.5 text-start shadow-none",
      "hover:bg-surface data-[hovered=true]:bg-surface",
      "data-[pressed=true]:scale-[0.995]",
      "[--button-bg:var(--surface)] [--button-bg-hover:var(--surface)] [--button-bg-pressed:var(--surface)]",
    ].join(" "),
    avatarWrap: "relative size-14 shrink-0 overflow-hidden rounded-full",
    avatar: "pointer-events-none absolute inset-0 size-full object-cover",
    content: "flex min-w-0 flex-1 flex-col gap-1.5",
    title: "tracking-tight text-foreground",
    price: "text-muted",
    tags: "flex flex-wrap items-center gap-x-3 gap-y-1",
    tag: "inline-flex items-center gap-1 text-sm text-foreground",
    tagIcon: "size-3.5 shrink-0 text-muted",
    ratingRow: "flex items-center gap-1.5",
    stars: "flex items-center gap-0.5",
    star: "shrink-0 text-accent",
    starEmpty: "shrink-0 text-muted/40",
    ratingText: "text-sm text-foreground",
    ratingCount: "text-muted",
    availability: "inline-flex items-center gap-1 text-sm font-medium",
    availabilityRemote: "text-success",
    availabilityInPerson: "text-danger",
    availabilityIcon: "size-3.5 shrink-0",
    chevron: "mt-1 size-4 shrink-0 text-muted",
  },
});

export type CoachNearbyCardVariantProps = VariantProps<
  typeof coachNearbyCardVariants
>;
