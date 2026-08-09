import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";
import { mapLeafletThemeClasses } from "../shared/map-leaflet-theme";

export const coachMapVariants = tv({
  slots: {
    root: "relative size-full min-h-0 overflow-hidden bg-map-land",
    mapCanvas: [
      "absolute inset-0 z-0 size-full",
      mapLeafletThemeClasses,
      "[&_.coach-map-pin]:!bg-transparent [&_.coach-map-pin]:!border-0",
    ].join(" "),
    mapSkeleton: "absolute inset-0 z-[1] rounded-none",
    zoomControls: [
      "pointer-events-auto absolute end-4 top-[28%] z-20",
      "flex flex-col items-center gap-2",
    ].join(" "),
    zoomButton: [
      "size-10 min-w-10 rounded-full",
      "bg-overlay text-overlay-foreground shadow-sm",
      "hover:bg-overlay data-[hovered=true]:bg-overlay",
    ].join(" "),
    zoomSlider: "h-36 w-10",
    zoomTrack: [
      "w-2 rounded-full bg-default",
      "before:bg-default",
    ].join(" "),
    zoomFill: "rounded-full bg-accent",
    zoomThumb: [
      "size-4 rounded-full border-2 border-accent bg-overlay",
      "shadow-sm",
    ].join(" "),
  },
});

export type CoachMapVariantProps = VariantProps<typeof coachMapVariants>;
