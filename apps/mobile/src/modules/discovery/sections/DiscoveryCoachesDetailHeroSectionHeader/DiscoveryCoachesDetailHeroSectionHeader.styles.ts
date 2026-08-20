export const discoveryCoachesDetailHeroSectionHeaderStyles = {
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
  stage: "relative z-10 w-full",
  bar: [
    "pointer-events-none absolute inset-x-0 top-0 z-30",
    "flex h-[72px] min-h-[72px] items-center justify-between gap-2.5",
    "px-screen",
  ].join(" "),
  barStart: "pointer-events-auto relative z-40 shrink-0",
  barEnd: "pointer-events-auto relative z-40 flex shrink-0 items-center gap-2",
  compactTitle: [
    "pointer-events-none absolute inset-x-20 top-1/2 -translate-y-1/2",
    "origin-center truncate text-center text-lg text-foreground",
  ].join(" "),
  control: [
    "rounded-full border-0 bg-surface text-foreground shadow-md",
    "backdrop-blur-xl",
    "hover:bg-surface pressed:bg-surface",
  ].join(" "),
  controlActive: "text-accent",
  avatar: [
    "absolute z-20 overflow-hidden rounded-lg",
    "origin-top-left rtl:origin-top-right",
    "ring-1 ring-foreground/80",
    "bg-surface text-surface-foreground",
  ].join(" "),
  avatarImage: "size-full object-cover object-top",
  identity: [
    "absolute z-20 flex min-w-0 items-center text-start",
    "overflow-hidden",
  ].join(" "),
  nameWrap: [
    "origin-top-left rtl:origin-top-right",
    "flex w-max max-w-full items-center",
  ].join(" "),
  name: [
    "truncate text-[1.65rem] leading-none tracking-tight text-foreground",
  ].join(" "),
} as const;
