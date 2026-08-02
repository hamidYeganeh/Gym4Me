export const discoveryMapScreenStyles = {
  root: [
    "h-dvh max-h-dvh overflow-hidden bg-background",
    /* Full-bleed map: clear AppLayout main insets (coach card owns bottom safe area) */
    "[&_main]:min-h-0 [&_main]:flex-1 [&_main]:px-0 [&_main]:pb-0",
  ].join(" "),
  stage: "relative h-full min-h-0 w-full flex-1",
  header: "border-b-0 bg-background/85 backdrop-blur-md",
} as const;
