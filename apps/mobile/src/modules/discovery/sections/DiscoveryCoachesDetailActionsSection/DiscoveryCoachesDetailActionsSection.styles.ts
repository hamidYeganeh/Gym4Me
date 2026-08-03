export const discoveryCoachesDetailActionsSectionStyles = {
  root: [
    "pointer-events-none fixed inset-x-0 bottom-0 z-30",
    "bg-linear-to-t from-background via-background/95 to-transparent",
    "px-4 pt-8",
    "pb-[max(0.85rem,env(safe-area-inset-bottom))]",
  ].join(" "),
  pill: [
    "pointer-events-auto mx-auto flex h-14 w-full max-w-lg overflow-hidden rounded-full",
    "border border-border bg-foreground shadow-lg",
  ].join(" "),
  action: [
    "h-full min-w-0 flex-1 justify-start gap-2 rounded-none border-0",
    "bg-transparent px-6 font-semibold text-background shadow-none",
    "hover:bg-background/10 pressed:bg-background/15",
  ].join(" "),
  actionLabel: "truncate text-background",
  accent: "pointer-events-none w-16 shrink-0 self-stretch bg-accent",
} as const;
