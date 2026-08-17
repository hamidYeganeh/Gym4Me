export const discoveryClubsReserveScreenStyles = {
  root: "relative min-h-dvh w-full bg-background",
  scroll: [
    "flex min-h-dvh flex-col",
    "pb-[calc(6.5rem+env(safe-area-inset-bottom))]",
  ].join(" "),
  stepPanel: "flex flex-col gap-6",
} as const;
