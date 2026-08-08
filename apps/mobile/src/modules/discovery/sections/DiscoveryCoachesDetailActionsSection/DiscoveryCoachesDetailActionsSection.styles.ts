export const discoveryCoachesDetailActionsSectionStyles = {
  root: [
    "pointer-events-none fixed inset-x-0 bottom-0 z-30 isolate",
    "overflow-hidden",
    "bg-linear-to-t from-background via-background/85 to-transparent",
    "px-5 pt-10",
    "pb-[max(0.85rem,env(safe-area-inset-bottom))]",
  ].join(" "),
  blur: "pointer-events-none absolute inset-0 z-0",
  stack: [
    "pointer-events-auto relative z-10 mx-auto flex w-full max-w-lg",
    "flex-col gap-2.5",
  ].join(" "),
  primary: "h-14 w-full",
  secondary: "h-14 w-full",
  confirmLabel: "truncate",
} as const;
