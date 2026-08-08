import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubCardVariants = tv({
  slots: {
    root: "relative flex overflow-hidden rounded-[24px]",
    media: "absolute inset-0 overflow-hidden",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    mediaScrim:
      "pointer-events-none absolute inset-0 bg-linear-to-t from-background to-transparent",
    topBar: "relative z-10 flex w-full items-start justify-between gap-3",
    ratingChip: [
      "h-8 max-w-full border-0 px-2.5",
      "backdrop-blur-md",
      "[--chip-bg:color-mix(in_oklch,var(--stats-foreground)_25%,transparent)]",
      "[--chip-fg:var(--stats-foreground)]",
      "[&_.chip__label]:font-medium",
    ].join(" "),
    ratingChipIcon: "size-3.5 shrink-0 text-stats-foreground",
    ratingCount: "opacity-80",
    stars: "flex items-center gap-0.5",
    star: "shrink-0 text-accent",
    starEmpty: "shrink-0 text-stats-foreground/35",
    actions: "flex items-center gap-2",
    iconButton: "shrink-0 rounded-full",
    body: "relative z-10 mt-auto flex w-full min-w-0 flex-col",
    header: "min-w-0 p-0",
    title: "tracking-tight text-foreground",
    subtitle: "text-muted",
    location: "flex min-w-0 items-center gap-1.5 text-muted",
    locationIcon: "size-3.5 shrink-0 text-muted",
    features: "flex flex-wrap items-center gap-2",
    feature: [
      "h-7 max-w-full gap-1 border-0 px-2.5",
      "backdrop-blur-md",
      "[--chip-bg:color-mix(in_oklch,var(--foreground)_12%,var(--surface))]",
      "[--chip-fg:var(--foreground)]",
      "[&_.chip__label]:text-xs [&_.chip__label]:font-medium",
    ].join(" "),
    featureIcon: "size-3 shrink-0 text-accent",
    divider:
      "bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
    footer: "flex w-full min-w-0 items-end justify-between gap-3",
    priceGroup:
      "flex min-w-0 flex-wrap items-baseline gap-1 text-foreground",
    pricePrefix: "text-xs font-normal text-muted",
    price: "font-semibold text-foreground",
    priceSuffix: "text-xs font-normal text-muted",
    action: "shrink-0",
    ctaGroup: "flex shrink-0 flex-col items-end gap-2",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "aspect-[4/3] w-full max-w-xl flex-col p-6",
        body: "flex-row items-end justify-between gap-4",
        header: "flex-1 gap-1",
        title: "text-xl font-semibold sm:text-2xl",
        subtitle: "text-sm sm:text-base",
        price: "text-sm font-medium",
        action: "rounded-full",
      },
      vertical: {
        root: "aspect-[3/4] w-full max-w-[300px] flex-col p-5",
        body: "gap-3",
        header: "gap-1.5",
        title: "text-2xl font-semibold leading-tight",
        location: "text-sm",
        footer: "pt-0.5",
        price: "text-xl leading-none",
        action: [
          "rounded-lg px-3.5 text-xs font-bold uppercase tracking-wide",
          "[--button-bg:var(--accent)] [--button-fg:var(--accent-foreground)]",
          "[--button-bg-hover:var(--accent)] [--button-bg-pressed:var(--accent)]",
          "bg-accent text-accent-foreground",
          "hover:opacity-90 data-[hovered=true]:opacity-90",
          "data-[pressed=true]:scale-[0.97]",
        ].join(" "),
      },
      fullWidth: {
        root: [
          "aspect-[16/10] w-full max-w-none flex-col rounded-[28px] p-5",
          "sm:aspect-[21/9] sm:p-6",
        ].join(" "),
        body: "flex-row items-end justify-between gap-4",
        header: "flex-1 gap-1",
        title: "text-2xl font-semibold sm:text-3xl",
        subtitle: "text-sm sm:text-base",
        price: "text-base font-semibold",
        action: [
          "rounded-full px-4",
          "[--button-bg:var(--accent)] [--button-fg:var(--accent-foreground)]",
          "bg-accent text-accent-foreground",
        ].join(" "),
      },
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export type ClubCardVariantProps = VariantProps<typeof clubCardVariants>;
