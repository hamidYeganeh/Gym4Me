import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";
import { mapLeafletThemeClasses } from "../shared/map-leaflet-theme";

export const coachMapVariants = tv({
  slots: {
    root: "relative size-full min-h-0 overflow-hidden bg-map-land",
    mapCanvas: [
      "absolute inset-0 z-0 size-full",
      mapLeafletThemeClasses,
    ].join(" "),
    mapSkeleton: "absolute inset-0 z-[1] rounded-none",
    zoomControls: [
      "pointer-events-auto absolute end-4 top-[26%] z-20",
      "flex flex-col items-center gap-1 rounded-full bg-overlay/92 p-1.5",
      "shadow-[var(--overlay-shadow)] backdrop-blur-sm",
    ].join(" "),
    zoomButton: [
      "size-9 min-w-9 rounded-full",
      "bg-transparent text-overlay-foreground shadow-none",
      "hover:bg-default/40 data-[hovered=true]:bg-default/40",
    ].join(" "),
    zoomSlider: "h-32 w-9",
    zoomTrack: [
      "w-1.5 rounded-full bg-default",
      "before:bg-default",
    ].join(" "),
    zoomFill: "rounded-full bg-accent",
    zoomThumb: [
      "size-3.5 rounded-full border-2 border-accent bg-overlay",
      "shadow-sm",
    ].join(" "),
  },
});

export type CoachMapVariantProps = VariantProps<typeof coachMapVariants>;
