export const discoveryMapScreenStyles = {
  root: [
    "h-dvh max-h-dvh overflow-hidden bg-map-land",
    /* Full-bleed map: clear AppLayout main insets (coach card owns bottom safe area) */
    "[&_main]:min-h-0 [&_main]:flex-1 [&_main]:px-0 [&_main]:pb-0",
  ].join(" "),
  stage: "relative h-full min-h-0 w-full flex-1",
  header:
    "border-b-0 bg-linear-to-t from-transparent via-map-land/80 to-map-land",
} as const;
