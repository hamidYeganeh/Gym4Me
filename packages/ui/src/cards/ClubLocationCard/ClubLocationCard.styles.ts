import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubLocationCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full max-w-md flex-col overflow-hidden rounded-[28px] p-0",
      "border border-border/70 bg-default text-default-foreground shadow-sm",
    ].join(" "),
    mapShell: "relative w-full overflow-hidden bg-surface-tertiary p-0",
    mapCanvas: [
      "absolute inset-0 z-0 size-full",
      "[&_.leaflet-control-attribution]:!bg-transparent [&_.leaflet-control-attribution]:!text-[9px]",
      "[&_.leaflet-control-attribution]:!text-muted [&_.leaflet-control-attribution]:!m-1",
      "[&_.club-location-tip]:!bg-transparent [&_.club-location-tip]:!border-0",
    ].join(" "),
    mapSkeleton: "absolute inset-0 z-[1] rounded-none",
    controlsStart:
      "pointer-events-auto absolute start-3 top-3 z-20 flex flex-col gap-2",
    controlsEnd: "pointer-events-auto absolute end-3 top-3 z-20",
    mapButton: [
      "size-10 min-w-10 rounded-2xl",
      "bg-overlay/70 text-overlay-foreground backdrop-blur-md",
      "hover:bg-overlay/85 data-[hovered=true]:bg-overlay/85",
      "shadow-sm",
    ].join(" "),
    footer:
      "relative z-10 flex items-end justify-between gap-4 bg-default px-5 pb-5 pt-4",
    footerText: "flex min-w-0 flex-1 flex-col gap-2",
    header: "gap-0 p-0",
    title: "text-xl font-semibold tracking-tight text-foreground",
    meta: "flex flex-wrap items-center gap-2 text-sm text-muted",
    metaItem: "inline-flex items-center gap-1.5",
    metaIcon: "size-3.5 shrink-0 opacity-80",
    metaDot: "size-1 shrink-0 rounded-full bg-muted",
    action: [
      "size-14 min-w-14 shrink-0 rounded-[18px]",
      "[--button-bg:var(--accent)] [--button-fg:var(--accent-foreground)]",
      "[--button-bg-hover:var(--accent)] [--button-bg-pressed:var(--accent)]",
      "bg-accent text-accent-foreground",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
      "data-[pressed=true]:scale-[0.97]",
    ].join(" "),
  },
});

export type ClubLocationCardVariantProps = VariantProps<
  typeof clubLocationCardVariants
>;
