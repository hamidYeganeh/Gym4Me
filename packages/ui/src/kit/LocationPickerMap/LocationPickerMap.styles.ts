import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const locationPickerMapVariants = tv({
  slots: {
    root: "relative size-full min-h-[240px] overflow-hidden rounded-2xl bg-surface-secondary",
    mapCanvas: [
      "absolute inset-0 z-0 size-full",
      "[&_.leaflet-control-attribution]:!bg-transparent [&_.leaflet-control-attribution]:!text-[9px]",
      "[&_.leaflet-control-attribution]:!text-muted [&_.leaflet-control-attribution]:!m-1",
      "[&_.location-picker-pin]:!bg-transparent [&_.location-picker-pin]:!border-0",
      "[&_.leaflet-container]:cursor-crosshair",
    ].join(" "),
    mapSkeleton: "absolute inset-0 z-[1] rounded-none",
    zoomControls: [
      "pointer-events-auto absolute end-3 top-1/2 z-20 -translate-y-1/2",
      "flex flex-col items-center gap-2",
    ].join(" "),
    zoomButton: [
      "size-10 min-w-10 rounded-full",
      "bg-overlay text-overlay-foreground shadow-sm",
      "hover:bg-overlay data-[hovered=true]:bg-overlay",
    ].join(" "),
    zoomSlider: "h-28 w-10",
    zoomTrack: ["w-2 rounded-full bg-default", "before:bg-default"].join(" "),
    zoomFill: "rounded-full bg-accent",
    zoomThumb: [
      "size-4 rounded-full border-2 border-accent bg-overlay",
      "shadow-sm",
    ].join(" "),
  },
});

export type LocationPickerMapVariantProps = VariantProps<
  typeof locationPickerMapVariants
>;
