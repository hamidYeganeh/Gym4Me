import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachCardVariants = tv({
  slots: {
    root: [
      "relative flex shrink-0 flex-col overflow-hidden rounded-[24px] p-4",
      "border-0 bg-surface shadow-none ring-1 ring-foreground/10",
      "outline-none transition-transform duration-fast ease-app",
      "data-[pressable=true]:cursor-pointer",
      "data-[pressable=true]:active:scale-[0.985]",
      "data-[pressable=true]:focus-visible:ring-2 data-[pressable=true]:focus-visible:ring-accent",
    ].join(" "),
    media: "absolute inset-0 overflow-hidden",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    scrim: [
      "pointer-events-none absolute inset-0",
      "bg-linear-to-t from-background via-background/75 to-transparent",
    ].join(" "),
    topBar: "relative z-10 flex w-full items-start justify-between gap-3",
    badge: [
      "h-7 max-w-[70%] rounded-full border-0 px-2.5",
      "[--chip-bg:var(--foreground)] [--chip-fg:var(--background)]",
      "[&_.chip__label]:truncate [&_.chip__label]:text-xs [&_.chip__label]:font-semibold",
    ].join(" "),
    action: [
      "size-9 min-w-9 shrink-0 rounded-full",
      "bg-background text-foreground shadow-[0_4px_16px_rgb(0_0_0_/_0.14)]",
      "ring-1 ring-foreground/15",
      "hover:bg-background data-[hovered=true]:bg-background",
      "data-[pressed=true]:scale-[0.96]",
    ].join(" "),
    actionIcon: "size-4 shrink-0 text-muted",
    body: "relative z-10 mt-auto flex w-full min-w-0 flex-col",
    title: "min-w-0 tracking-tight text-foreground",
    subtitle: "min-w-0 truncate text-muted",
    meta: "flex min-w-0 items-center gap-1.5 text-muted",
    metaGroup: "inline-flex min-w-0 items-center gap-1.5",
    metaItem: "min-w-0 truncate text-sm",
    metaSeparator: "shrink-0 text-sm leading-none",
    ratingRow: "flex min-w-0 items-center gap-1.5",
    stars: "flex items-center gap-px",
    starWrap: "relative inline-flex size-4 shrink-0",
    starFill: "absolute inset-y-0 start-0 overflow-hidden",
    star: "block size-4 max-w-none shrink-0 text-warning",
    starEmpty: "block size-4 max-w-none shrink-0 text-foreground/30",
    ratingValue: "text-sm font-semibold text-foreground",
    ratingCount: "text-sm font-normal text-foreground/70",
    stats: "flex min-w-0 items-center gap-1.5 text-foreground",
    statGroup: "inline-flex min-w-0 items-center gap-1.5",
    statItem: "inline-flex min-w-0 items-center gap-1",
    statIcon: "size-3.5 shrink-0 text-foreground",
    statLabel: "truncate text-sm font-medium",
    statSeparator: "shrink-0 text-sm leading-none text-muted",
    author: "flex min-w-0 items-center gap-2",
    avatar: "size-7 shrink-0",
    authorName: "min-w-0 truncate text-foreground",
  },
  variants: {
    variant: {
      compact: {
        root: "h-[280px] w-[260px]",
        body: "gap-1",
        title: "line-clamp-2 text-xl font-bold leading-tight",
      },
      default: {
        root: "h-[367px] w-[276px]",
        body: "gap-1.5",
        title: "line-clamp-2 text-2xl font-bold leading-tight",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type CoachCardVariantProps = VariantProps<typeof coachCardVariants>;
