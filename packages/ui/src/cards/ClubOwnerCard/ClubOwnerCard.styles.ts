import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubOwnerCardVariants = tv({
  slots: {
    root: [
      "flex h-auto w-full items-center gap-3 rounded-2xl bg-transparent px-1 py-2",
      "text-start shadow-none",
      "hover:bg-surface-secondary/50 data-[hovered=true]:bg-surface-secondary/50",
      "data-[pressed=true]:scale-[0.995]",
      "[--button-bg:transparent] [--button-bg-hover:transparent] [--button-bg-pressed:transparent]",
    ].join(" "),
    avatarWrap: "relative size-14 shrink-0",
    avatar: [
      "pointer-events-none size-full overflow-hidden rounded-full",
      "border border-border object-cover",
      "bg-surface-secondary",
    ].join(" "),
    rank: [
      "absolute -start-1 top-1/2 z-10 -translate-y-1/2",
      "flex size-6 items-center justify-center rounded-full",
      "bg-default text-[0.7rem] font-bold leading-none text-foreground",
      "ring-2 ring-background",
    ].join(" "),
    content: "flex min-w-0 flex-1 flex-col gap-1",
    title: "truncate text-[0.95rem] font-bold leading-tight tracking-tight text-foreground",
    meta: [
      "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5",
      "text-sm text-muted",
    ].join(" "),
    experience: "inline-flex items-center gap-1",
    experienceIcon: "size-3.5 shrink-0 text-muted",
    separator: "text-muted/70",
    rating: "inline-flex items-center gap-1 text-muted",
    star: "size-3.5 shrink-0 text-stats-orange",
    ratingValue: "tabular-nums text-foreground",
    ratingCount: "tabular-nums text-muted",
    chevron: "size-5 shrink-0 text-muted",
  },
});

export type ClubOwnerCardVariantProps = VariantProps<
  typeof clubOwnerCardVariants
>;
