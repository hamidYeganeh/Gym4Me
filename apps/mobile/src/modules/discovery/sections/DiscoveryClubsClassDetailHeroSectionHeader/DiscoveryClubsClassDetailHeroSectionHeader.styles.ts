export const discoveryClubsClassDetailHeroSectionHeaderStyles = {
  root: [
    "pointer-events-none fixed inset-x-0 top-0 z-40 isolate",
    "overflow-hidden",
    "pt-[env(safe-area-inset-top)]",
  ].join(" "),
  veil: [
    "pointer-events-none absolute inset-0 z-0",
    "bg-linear-to-t from-transparent via-background/70 to-background",
  ].join(" "),
  blur: "pointer-events-none absolute inset-0 z-0",
  bar: [
    "pointer-events-auto relative z-10 flex h-[72px] min-h-[72px] items-center justify-between",
    "px-screen",
  ].join(" "),
  actions: "flex items-center gap-2",
  control: [
    "rounded-full border-0 bg-surface text-foreground shadow-md",
    "backdrop-blur-xl",
    "hover:bg-surface pressed:bg-surface",
  ].join(" "),
  controlActive: "text-danger",
} as const;
