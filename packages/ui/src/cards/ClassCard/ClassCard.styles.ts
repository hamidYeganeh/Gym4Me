import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const classCardVariants = tv({
  slots: {
    root: [
      "relative flex h-[420px] w-[340px] shrink-0 flex-col overflow-hidden",
      "rounded-[24px] p-4",
      "border-0 shadow-none",
      "outline-none transition-transform duration-fast ease-app",
      "data-[pressable=true]:cursor-pointer",
      "data-[pressable=true]:active:scale-[0.985]",
      "data-[pressable=true]:focus-visible:ring-2 data-[pressable=true]:focus-visible:ring-accent",
    ].join(" "),
    media: "absolute inset-0 overflow-hidden",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    scrim: "pointer-events-none absolute inset-0",
    topBar: "relative z-10 flex w-full items-start justify-between gap-3",
    badge: [
      "h-6 max-w-[70%] rounded-full border-0 px-2.5",
      "[&_.chip__label]:truncate [&_.chip__label]:text-xs [&_.chip__label]:font-medium",
    ].join(" "),
    action: [
      "inline-flex size-8 min-w-8 shrink-0 items-center justify-center rounded-full",
      "data-[pressed=true]:scale-[0.96]",
    ].join(" "),
    actionIcon: "size-3.5 shrink-0",
    body: "relative z-10 mt-auto flex w-full min-w-0 flex-col",
    title: "min-w-0 tracking-tight",
    author: "mt-2 flex min-w-0 items-center",
    avatar: "size-7 shrink-0",
    authorName: "min-w-0 truncate",
    stats: "mt-4 flex w-full min-w-0 items-start justify-between",
    stat: "flex min-w-0 flex-col",
    statValueRow: "inline-flex min-w-0 items-center",
    statIcon: "size-4 shrink-0",
    statValue: "truncate tabular-nums",
    statLabel: "min-w-0 truncate",
  },
  variants: {
    variant: {
      dark: {
        root: "bg-eclipse text-snow",
        scrim:
          "bg-linear-to-t from-eclipse from-[10%] via-eclipse/70 via-[42%] to-transparent",
        badge: [
          "[--chip-bg:var(--snow)] [--chip-fg:var(--eclipse)]",
        ].join(" "),
        action: [
          "bg-transparent text-snow ring-1 ring-snow",
          "hover:bg-snow/10 data-[hovered=true]:bg-snow/10",
          "[--button-bg:transparent] [--button-bg-hover:color-mix(in_oklch,var(--snow)_12%,transparent)]",
        ].join(" "),
        actionIcon: "text-snow",
        title: "line-clamp-2 text-[28px] font-bold leading-[1.15] text-snow",
        author: "gap-2",
        authorName: "text-[15px] text-snow",
        avatar: "ring-1 ring-snow/35",
        stats: "gap-3",
        stat: "gap-0.5",
        statValueRow: "gap-1.5",
        statIcon: "text-snow",
        statValue: "text-base font-bold text-snow",
        statLabel: "text-xs text-snow/70",
      },
      light: {
        root: "bg-snow text-eclipse",
        scrim:
          "bg-linear-to-t from-snow from-[30%] via-snow/90 via-[52%] to-transparent",
        badge: [
          "[--chip-bg:var(--eclipse)] [--chip-fg:var(--snow)]",
        ].join(" "),
        action: [
          "bg-snow text-eclipse/40 ring-1 ring-eclipse/15",
          "hover:bg-snow data-[hovered=true]:bg-snow",
          "[--button-bg:var(--snow)] [--button-bg-hover:var(--snow)]",
        ].join(" "),
        actionIcon: "text-eclipse/40",
        title: "line-clamp-2 text-[28px] font-bold leading-[1.15] text-eclipse",
        author: "gap-2",
        authorName: "text-[15px] text-eclipse/55",
        avatar: "ring-1 ring-eclipse/10",
        stats: "gap-3",
        stat: "gap-0.5",
        statValueRow: "gap-1.5",
        statIcon: "text-eclipse/45",
        statValue: "text-base font-bold text-eclipse",
        statLabel: "text-xs text-eclipse/45",
      },
    },
  },
  defaultVariants: {
    variant: "dark",
  },
});

export type ClassCardVariantProps = VariantProps<typeof classCardVariants>;
