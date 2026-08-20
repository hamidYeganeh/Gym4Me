export const discoveryClubsDetailHeroSectionHeaderStyles = {
  root: [
    "pointer-events-none fixed inset-x-0 top-0 z-40 isolate",
    "overflow-hidden",
    "pt-[env(safe-area-inset-top)]",
  ].join(" "),
  veil: [
    "pointer-events-none absolute inset-0 z-0",
    "rounded-b-[2.5rem] bg-surface",
  ].join(" "),
  blur: "pointer-events-none absolute inset-0 z-0",
  bar: [
    "pointer-events-auto relative z-10 flex h-[72px] min-h-[72px] items-center justify-between",
    "px-screen",
  ].join(" "),
  title: [
    "pointer-events-none absolute inset-x-20 top-1/2 -translate-y-1/2",
    "origin-center truncate text-center text-lg text-foreground",
  ].join(" "),
  actions: "flex items-center gap-2",
  control: [
    "rounded-full border-0 bg-surface text-foreground shadow-md",
    "backdrop-blur-xl",
    "hover:bg-surface pressed:bg-surface",
  ].join(" "),
  controlActive: "text-danger",
} as const;
