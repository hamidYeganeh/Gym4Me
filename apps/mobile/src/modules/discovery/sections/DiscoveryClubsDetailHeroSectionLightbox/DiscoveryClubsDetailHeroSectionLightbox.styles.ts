export const discoveryClubsDetailHeroSectionLightboxStyles = {
  dialog: "rounded-none bg-[var(--eclipse)] text-[var(--snow)] shadow-none",
  root: "flex h-dvh w-full flex-col",
  header:
    "flex items-center justify-between px-screen pt-[max(0.75rem,env(safe-area-inset-top))]",
  count: "text-[var(--snow)]",
  stage: "relative flex min-h-0 flex-1 items-center justify-center px-screen",
  image: "object-contain",
  thumbs:
    "flex justify-center gap-2.5 px-screen pb-[max(1.25rem,env(safe-area-inset-bottom))]",
  thumbButton:
    "relative h-16 w-14 min-w-0 overflow-hidden rounded-2xl border-2 bg-transparent p-0",
  thumbActive: "border-[var(--snow)]",
  thumbIdle: "border-[var(--snow)]/40",
  thumbImage: "object-cover",
} as const;
