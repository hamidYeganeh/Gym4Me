import { tv } from "tailwind-variants";

export const discoveryClubsDetailHeroSectionLightboxVariants = tv({
  slots: {
    dialog: [
      "rounded-none border-0 shadow-none",
      "bg-background text-foreground",
    ].join(" "),
    root: "flex h-dvh w-full flex-col",
    header: [
      "relative z-20 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2",
      "bg-background",
      "px-screen pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
    ].join(" "),
    headerTitle: "text-center text-foreground",
    headerSide: "flex items-center justify-center",
    stageWrap: [
      "relative flex min-h-0 flex-1 flex-col items-stretch justify-center",
      "overflow-hidden px-screen",
    ].join(" "),
    viewport: "h-full w-full overflow-hidden",
    track: "flex h-full touch-pan-y",
    slide: "min-w-0 shrink-0 grow-0 basis-full",
    slideInner: "relative h-full w-full",
    image: [
      "pointer-events-none block h-full w-full object-cover select-none",
      "rounded-3xl bg-surface-secondary",
    ].join(" "),
    favorite: "text-foreground data-[pressed=true]:scale-[0.96]",
    caption: [
      "pointer-events-none absolute inset-x-screen bottom-14 z-10",
      "rounded-b-3xl",
      "bg-linear-to-t from-background/90 via-background/50 to-transparent",
      "px-5 pb-6 pt-12",
    ].join(" "),
    captionTitle: "text-foreground",
    captionBody: "mt-1 text-muted leading-relaxed",
    navPrev:
      "pointer-events-auto absolute start-[calc(var(--spacing-screen)+0.5rem)] top-1/2 z-20 -translate-y-1/2",
    navNext:
      "pointer-events-auto absolute end-[calc(var(--spacing-screen)+0.5rem)] top-1/2 z-20 -translate-y-1/2",
    navButton: [
      "size-11 min-w-11 rounded-full",
      "bg-foreground text-background shadow-md",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
      "data-[pressed=true]:scale-[0.96]",
    ].join(" "),
    dots: [
      "pointer-events-none absolute inset-x-0 bottom-4 z-20",
      "flex items-center justify-center gap-1.5",
    ].join(" "),
    dot: "size-1.5 rounded-full bg-muted transition-all",
    dotActive: "h-1.5 w-5 rounded-full bg-accent",
    thumbsViewport: [
      "h-24 w-full shrink-0 overflow-hidden px-screen",
      "mb-[max(0.5rem,env(safe-area-inset-bottom))]",
    ].join(" "),
    thumbsTrack: "flex h-full touch-pan-x items-center gap-2.5",
    thumbButton: [
      "relative !size-16 min-h-16 min-w-16 shrink-0",
      "overflow-hidden rounded-[16px] border-2 bg-transparent p-0",
    ].join(" "),
    thumbActive: "border-accent",
    thumbIdle: "border-border opacity-90",
    thumbImage: [
      "pointer-events-none block size-full object-cover select-none",
    ].join(" "),
  },
});

export const discoveryClubsDetailHeroSectionLightboxStyles =
  discoveryClubsDetailHeroSectionLightboxVariants();
